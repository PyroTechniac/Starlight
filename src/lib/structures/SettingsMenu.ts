// Copyright (c) 2019 kyranet. All rights reserved. Apache license.
// This is a recreation of work. The original work can be found here.
// https://github.com/kyranet/Skyra/blob/master/src/lib/util/LongLivingReactionCollector.ts
// https://github.com/kyranet/Skyra/blob/master/src/lib/structures/SettingsMenu.ts

import { Client, Guild, TextChannel, User, DiscordAPIError, MessageCollector, MessageEmbed } from 'discord.js';
import { KlasaMessage, Schema, SchemaEntry, SchemaFolder, Settings, SettingsFolderUpdateOptions } from 'klasa';
import { Events, Time, Databases } from '../types/Enums';
import { getColor, floatPromise, isSchemaFolder } from '../util/Utils';
import { api } from '../util/Api';

export type LongLivingReactionCollectorListener = (reaction: LLRCData) => void;

export class LongLivingReactionCollector {

	public client: Client;
	public listener: LongLivingReactionCollectorListener | null;
	public endListener: (() => void) | null;

	private _timer: NodeJS.Timeout | null = null;

	public constructor(client: Client, listener: LongLivingReactionCollectorListener | null = null, endListener: (() => void) | null = null) {
		this.client = client;
		this.listener = listener;
		this.endListener = endListener;
		LongLivingReactionCollector.llrCollectors.add(this);
	}

	public setListener(listener: LongLivingReactionCollectorListener | null): this {
		this.listener = listener;
		return this;
	}

	public setEndListener(listener: () => void): this {
		this.endListener = listener;
		return this;
	}

	public get ended(): boolean {
		return LongLivingReactionCollector.llrCollectors.has(this);
	}

	public send(reaction: LLRCData): void {
		if (this.listener) this.listener(reaction);
	}

	public setTime(time: number): this {
		if (this._timer) this.client.clearTimeout(this._timer);
		if (time === -1) this._timer = null;
		else this._timer = this.client.setTimeout((): this => this.end(), time);
		return this;
	}

	public end(): this {
		if (!LongLivingReactionCollector.llrCollectors.delete(this)) return this;

		if (this._timer) {
			this.client.clearTimeout(this._timer);
			this._timer = null;
		}

		if (this.endListener) {
			process.nextTick(this.endListener.bind(null));
			this.endListener = null;
		}

		return this;
	}

	private static readonly llrCollectors: Set<LongLivingReactionCollector> = new Set();

}


export interface LLRCDataEmoji {
	animated: boolean;
	id: string | null;
	managed: boolean | null;
	name: string;
	requireColons: boolean | null;
	roles: string[] | null;
	user: User | { id: string };
}

export interface LLRCData {
	channel: TextChannel;
	emoji: LLRCDataEmoji;
	guild: Guild;
	messageID: string;
	userID: string;
}

const EMOJIS = { BACK: '◀', STOP: '⏹' };
const TIMEOUT = Time.Minute * 15;

export class SettingsMenu {

	private readonly message: KlasaMessage;
	private schema: Schema | SchemaEntry;
	private readonly oldSettings: Settings;
	private messageCollector: MessageCollector | null = null;
	private errorMessage: string | null = null;
	private llrc: LongLivingReactionCollector | null = null;
	private readonly embed: MessageEmbed;
	private response: KlasaMessage | null = null;

	public constructor(message: KlasaMessage) {
		this.message = message;
		this.schema = this.message.client.gateways.get(Databases.Guilds)!.schema;
		this.oldSettings = this.message.guild!.settings.clone();
		this.embed = new MessageEmbed()
			.setAuthor(this.message.author.username, this.message.author.displayAvatarURL({ size: 128 }))
			.setColor(getColor(this.message));
	}

	private get pointerIsFolder(): boolean {
		return isSchemaFolder(this.schema);
	}

	private get changedCurrentPieceValue(): boolean {
		if (this.pointerIsFolder) return false;
		const schema = this.schema as SchemaEntry;
		if (schema.array) {
			const current = this.message.guild!.settings.get(this.schema.path) as unknown[];
			const old = this.oldSettings.get(this.schema.path) as unknown[];
			return current.length !== old.length || current.some((value, i): boolean => value !== old[i]);
		}
		// eslint-disable-next-line eqeqeq
		return this.message.guild!.settings.get(this.schema.path) != this.oldSettings.get(this.schema.path);
	}

	private get changedPieceValue(): boolean {
		if (isSchemaFolder(this.schema)) return false;
		const { schema } = this;
		// eslint-disable-next-line eqeqeq
		return this.message.guild!.settings.get(this.schema.path) != schema.default;
	}

	public async init(): Promise<void> {
		this.response = await this.message.send(this.message.language.get('SYSTEM_LOADING'));
		await this.response.react(EMOJIS.STOP);
		this.llrc = new LongLivingReactionCollector(this.message.client)
			.setListener(this.onReaction.bind(this))
			.setEndListener(this.stop.bind(this));
		this.llrc.setTime(TIMEOUT);
		this.messageCollector = this.response.channel.createMessageCollector((msg: KlasaMessage): boolean => msg.author.id === this.message.author.id);
		this.messageCollector.on('collect', this.onMessage.bind(this));
		await this._renderResponse();
	}

	private render(): MessageEmbed {
		const i18n = this.message.language;
		const description: string[] = [];
		if (this.pointerIsFolder) {
			description.push(i18n.get('COMMAND_CONF_MENU_RENDER_AT_FOLDER', this.schema.path || 'Root'));
			if (this.errorMessage) description.push(this.errorMessage);
			const keys: string[] = [];
			const folders: string[] = [];
			for (const [key, value] of (this.schema as Schema).entries()) {
				if (isSchemaFolder(value)) {
					if (value.configurableKeys.length) folders.push(key);
				} else if (value.configurable) {
					keys.push(key);
				}
			}

			if (!folders.length && !keys.length) description.push(i18n.get('COMMAND_CONF_MENU_RENDER_NOKEYS'));
			else description.push(i18n.get('COMMAND_CONF_MENU_RENDER_SELECT'), '', ...folders.map((folder): string => `• \\📁${folder}`), ...keys.map((key): string => `• ${key}`));
		} else {
			description.push(i18n.get('COMMAND_CONF_MENU_RENDER_AT_PIECE', this.schema.path));
			if (this.errorMessage) description.push('\n', this.errorMessage, '\n');
			if ((this.schema as SchemaEntry).configurable) {
				description.push(
					i18n.get(`SETTINGS_${this.schema.path.replace(/[.-]/g, '_').toUpperCase()}`),
					'',
					i18n.get('COMMAND_CONF_MENU_RENDER_TCTITLE'),
					i18n.get('COMMAND_CONF_MENU_RENDER_UPDATE'),
					(this.schema as SchemaEntry).array && (this.message.guild!.settings.get(this.schema.path) as unknown[]).length ? i18n.get('COMMAND_CONF_MENU_RENDER_REMOVE') : '',
					this.changedPieceValue ? i18n.get('COMMAND_CONF_MENU_RENDER_RESET') : '',
					this.changedCurrentPieceValue ? i18n.get('COMMAND_CONF_MENU_RENDER_UNDO') : '',
					'',
					i18n.get('COMMAND_CONF_MENU_RENDER_CVALUE', this.message.guild!.settings.display(this.message, this.schema).replace(/``+/g, '`\u200B`'))
				);
			}
		}

		const { parent } = this.schema as SchemaEntry | SchemaFolder;
		/* eslint-disable @typescript-eslint/no-floating-promises */
		if (parent) floatPromise(this.message, this._reactResponse(EMOJIS.BACK));
		else floatPromise(this.message, this._removeReactionFromUser(EMOJIS.BACK, this.message.client.user!.id));
		/* eslint-enable @typescript-eslint/no-floating-promises */

		return this.embed
			.setDescription(`${description.filter((v): boolean => v !== null).join('\n')}\n\u200B`)
			.setFooter(parent ? i18n.get('COMMAND_CONF_MENU_RENDER_BACK') : '')
			.setTimestamp();
	}

	private async onMessage(message: KlasaMessage): Promise<void> {
		if (!message.content) return;

		this.llrc!.setTime(TIMEOUT);
		this.errorMessage = null;
		if (this.pointerIsFolder) {
			const schema = (this.schema as Schema).get(message.content);
			if (schema && this.isConfigurable(schema)) this.schema = schema;
			else this.errorMessage = this.message.language.get('COMMAND_CONF_MENU_INVALID_KEY');
		} else {
			const [command, ...params] = message.content.split(' ');
			const commandLowerCase = command.toLowerCase();
			if (commandLowerCase === 'set') await this.tryUpdate(params.join(' '), { arrayAction: 'add' });
			else if (commandLowerCase === 'remove') await this.tryUpdate(params.join(' '), { arrayAction: 'remove' });
			else if (commandLowerCase === 'reset') await this.tryUpdate(null);
			else if (commandLowerCase === 'undo') await this.tryUndo();
			else this.errorMessage = this.message.language.get('COMMAND_CONF_MENU_INVALID_ACTION');
		}

		if (!this.errorMessage) floatPromise(this.message, message.nuke()); // eslint-disable-line @typescript-eslint/no-floating-promises
		await this._renderResponse();
	}

	private async onReaction(reaction: LLRCData): Promise<void> {
		if (reaction.userID !== this.message.author.id) return;
		this.llrc!.setTime(TIMEOUT);
		if (reaction.emoji.name === EMOJIS.STOP) {
			this.llrc!.end();
		} else if (reaction.emoji.name === EMOJIS.BACK) {
			floatPromise(this.message, this._removeReactionFromUser(EMOJIS.BACK, reaction.userID)); // eslint-disable-line @typescript-eslint/no-floating-promises
			if ((this.schema as SchemaFolder | SchemaEntry).parent) this.schema = (this.schema as SchemaFolder | SchemaEntry).parent;
			await this._renderResponse();
		}
	}

	private async _removeReactionFromUser(reaction: string, userID: string): Promise<unknown> {
		if (!this.response) return;
		try {
			return await api(this.message.client)
				.channels(this.message.channel.id)
				.messages(this.response.id)
				.reactions(encodeURIComponent(reaction), userID === this.message.client.user!.id ? '@me' : userID)
				.delete();
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.code === 10008) {
					this.response = null;
					this.llrc!.end();
					return this;
				}

				if (error.code === 10014) {
					return this;
				}
			}

			this.message.client.emit(Events.Error, error);
		}
	}

	private async _reactResponse(emoji: string): Promise<void> {
		if (!this.response) return;
		try {
			await this.response.react(emoji);
		} catch (error) { this._handleError(error); }
	}

	private async _renderResponse(): Promise<void> {
		if (!this.response) return;
		try {
			await this.response.edit(this.render());
		} catch (error) { this._handleError(error); }
	}

	private async tryUpdate(value: unknown, options?: SettingsFolderUpdateOptions): Promise<void> {
		const { errors, updated } = await (value === null
			? this.message.guild!.settings.reset(this.schema.path)
			: this.message.guild!.settings.update(this.schema.path, value, options));
		if (errors.length) this.errorMessage = String(errors[0]);
		else if (!updated.length) this.errorMessage = this.message.language.get('COMMAND_CONF_NOCHANGE', (this.schema as SchemaEntry).key);
	}

	private async tryUndo(): Promise<void> {
		if (this.changedCurrentPieceValue) {
			const previousValue = this.oldSettings.get(this.schema.path);
			const { errors } = await (previousValue === null
				? this.message.guild!.settings.reset(this.schema.path)
				: this.message.guild!.settings.update(this.schema.path, previousValue, { arrayAction: 'overwrite' }));
			if (errors.length) this.errorMessage = String(errors[0]);
		} else {
			this.errorMessage = this.message.language.get('COMMAND_CONF_NOCHANGE', (this.schema as SchemaEntry).key);
		}
	}

	private stop(): void {
		if (this.response) {
			if (this.response.reactions.size) {
				this.response.reactions.removeAll()
					.catch((err): boolean => this.response!.client.emit(Events.Error, err));
			}

			this.response.edit(this.message.language.get('COMMAND_CONF_MENU_SAVED'), { embed: null })
				.catch((error): boolean => this.message.client.emit(Events.Error, error));
		}

		if (!this.messageCollector!.ended) this.messageCollector!.stop();
	}

	private isConfigurable(schema: Schema | SchemaEntry): boolean {
		return isSchemaFolder(schema)
			? schema.configurableKeys.length !== 0
			: schema.configurable;
	}

	private _handleError(error: DiscordAPIError | unknown): void {
		if (error instanceof DiscordAPIError && error.code === 10008) {
			this.response = null;
			this.llrc!.end();
		} else {
			this.message.client.emit(Events.Error, error);
		}
	}

}
