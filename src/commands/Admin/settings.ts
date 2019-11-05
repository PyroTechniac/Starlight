import { StarlightCommand } from '../../lib/structures/StarlightCommand';
import { ApplyOptions } from '../../lib/util/Decorators';
import { Databases } from '../../lib/types/Enums';
import { SettingsMenu } from '../../lib/structures/SettingsMenu';
import { CommandOptions, KlasaMessage, Schema, SchemaEntry, SettingsFolderUpdateResult } from 'klasa';
import { Permissions, TextChannel } from 'discord.js';
import { toTitleCase, codeBlock } from '@klasa/utils';
import { isSchemaFolder } from '../../lib/util/Utils';

const MENU_REQUIREMENTS = Permissions.resolve([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_MESSAGES]);

@ApplyOptions<CommandOptions>({
	aliases: ['conf', 'config', 'configs', 'configuration'],
	description: (lang): string => lang.get('COMMAND_CONF_SERVER_DESCRIPTION'),
	guarded: true,
	permissionLevel: 6,
	requiredPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
	runIn: ['text'],
	subcommands: true,
	usage: '<set|show|remove|reset|menu:default> (key:key) (value:value) [...]',
	usageDelim: ' '
})
export default class extends StarlightCommand {

	public menu(message: KlasaMessage): Promise<void> {
		if (!(message.channel as TextChannel).permissionsFor(this.client.user!.id)!.has(MENU_REQUIREMENTS)) {
			throw message.language.get('COMMAND_CONF_MENU_NOPERMISSIONS');
		}
		return new SettingsMenu(message).init();
	}

	public show(message: KlasaMessage, [key]: [string]): Promise<KlasaMessage> {
		const piece = this.getPath(key);
		if (!piece || (isSchemaFolder(piece)
			? !piece.configurableKeys.length
			: !piece.configurable)) return message.sendLocale('COMMAND_CONF_GET_NOEXT', [key]);
		if (piece.type === 'Folder') {
			return message.sendLocale('COMMAND_CONF_SERVER', [
				key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '',
				codeBlock('asciidoc', message.guild!.settings.display(message, piece))
			]);
		}

		return message.sendLocale('COMMAND_CONF_GET', [piece.path, message.guild!.settings.display(message, piece)]);
	}

	public async set(message: KlasaMessage, [key, ...valueToSet]: string[]): Promise<KlasaMessage> {
		const status = await message.guild!.settings.update(key, valueToSet.join(' '), { onlyConfigurable: true, arrayAction: 'add' });
		return this.check(message, key, status) || message.sendLocale('COMMAND_CONF_UPDATED', [key, message.guild!.settings.display(message, status.updated[0].entry)]);
	}

	public async remove(message: KlasaMessage, [key, ...valueToRemove]: string[]): Promise<KlasaMessage> {
		const status = await message.guild!.settings.update(key, valueToRemove.join(' '), { onlyConfigurable: true, arrayAction: 'remove' });
		return this.check(message, key, status) || message.sendLocale('COMMAND_CONF_UPDATED', [key, message.guild!.settings.display(message, status.updated[0].entry)]);
	}

	public async reset(message: KlasaMessage, [key]: string[]): Promise<KlasaMessage> {
		const status = await message.guild!.settings.reset(key);
		return this.check(message, key, status) || message.sendLocale('COMMAND_CONF_RESET', [key, message.guild!.settings.display(message, status.updated[0].entry)]);
	}

	public init(): Promise<void> {
		this
			.createCustomResolver('key', (arg, _, message, [action]: string[]): string => {
				if (['show', 'menu'].includes(action) || arg) return arg;
				throw message.language.get('COMMAND_CONF_NOKEY');
			})
			.createCustomResolver('value', (arg, _, message, [action]: string[]): string => {
				if (!['set', 'remove'].includes(action) || arg) return arg;
				throw message.language.get('COMMAND_CONF_NOVALUE');
			});

		return Promise.resolve();
	}

	private getPath(key: string): Schema | SchemaEntry | undefined {
		const { schema } = this.client.gateways.get(Databases.Guilds)!;
		if (!key) return schema;
		try {
			return schema.get(key);
		} catch {
			return undefined;
		}
	}

	private check(message: KlasaMessage, key: string, { errors, updated }: SettingsFolderUpdateResult): Promise<KlasaMessage> | null {
		if (errors.length) return message.sendMessage(errors[0]);
		if (!updated.length) return message.sendLocale('COMMAND_CONF_NOCHANGE', [key]);
		return null;
	}

}
