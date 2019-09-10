import { Guild, Client, TextChannel, MessageEmbed, User, Message } from 'discord.js';
import { ModLogType, ModLogUser, ModLogModerator, ModLogJSON, ModLogColor } from '../types';
import { GuildSettings } from '../settings';


export class ModLog {

	public guild: Guild;

	public client: Client;

	public type: ModLogType | null;
	public user: ModLogUser | null;
	public moderator: ModLogModerator | null;
	public reason: string | null;
	public case: number | null;

	public constructor(guild: Guild) {
		this.guild = guild;
		this.client = guild.client;

		this.type = null;
		this.user = null;
		this.moderator = null;
		this.reason = null;
		this.case = null;
	}

	public get channel(): TextChannel | null {
		const id = this.guild.settings.get(GuildSettings.Channels.ModLog) as GuildSettings.Channels.ModLog;
		if (!id) return null;
		const channel = this.guild.channels.get(id);
		if (!channel || channel.type !== 'text') return null;
		if (!channel.permissionsFor(this.client.user!.id)!.has(['SEND_MESSAGES'])) return null;
		return channel as TextChannel;
	}

	public get embed(): MessageEmbed {
		const embed = new MessageEmbed()
			.setAuthor(this.moderator!.tag, this.moderator!.avatar)
			.setColor(ModLogColor.resolve(this.type!))
			.setDescription([
				`**Type**: ${this.type![0].toUpperCase() + this.type!.slice(1)}`,
				`**User**: ${this.user!.tag} (${this.user!.id})`,
				`**Reason**: ${this.reason || `Use \`${this.guild.settings.get(GuildSettings.Prefix)}reason ${this.case}\` to claim this log.`}`
			])
			.setFooter(`Case ${this.case!}`)
			.setTimestamp();
		return embed;
	}

	public setUser(user: User): this {
		this.user = {
			id: user.id,
			tag: user.tag
		};
		return this;
	}

	public setModerator(user: User): this {
		this.moderator = {
			id: user.id,
			tag: user.tag,
			avatar: user.displayAvatarURL()
		};
		return this;
	}

	public setReason(reason: string | string[] | null = null): this {
		this.reason = Array.isArray(reason) ? reason.join(' ') : reason;
		return this;
	}

	public setType(type: ModLogType): this {
		this.type = type;
		return this;
	}

	public async send(): Promise<Message> {
		const { channel, embed } = this;
		if (!channel) throw "The modlog channel doesn't seem to exist.";
		await this.getCase();
		return channel.send({ embed });
	}

	public toJSON(): ModLogJSON {
		return {
			'guild': this.guild.id,
			'type': this.type,
			'user': this.user,
			'moderator': this.moderator,
			'case': this.case,
			'reason': this.reason
		};
	}

	private async getCase(): Promise<number> {
		this.case = (this.guild.settings.get(GuildSettings.ModLogs) as GuildSettings.ModLogs).length;
		const { errors } = await this.guild.settings.update('modlogs', this.toJSON(), { arrayAction: 'add', throwOnError: true });
		if (errors.length) throw errors[0];
		return this.case!;
	}

	private _patch(data: ModLogJSON): this {
		this.case = data.case;
		this.moderator = data.moderator;
		this.reason = data.reason;
		this.type = data.type;
		this.user = data.user;

		return this;
	}

	public static fromJSON(guild: Guild, data: ModLogJSON): ModLog {
		return new this(guild)
			._patch(data);
	}

}
