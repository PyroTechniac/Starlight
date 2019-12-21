import * as Discord from 'discord.js';
import { Type } from 'klasa';

/* eslint-disable @typescript-eslint/no-use-before-define */

export abstract class Transformer<V extends Discord.Base, F extends FlattenedBase> {

	protected constructor(protected internal: V) {
	}

	public abstract transform(): F;

	public static resolve(value: Discord.User): UserTransformer;
	public static resolve(value: Discord.Role): RoleTransformer;
	public static resolve(value: Discord.NewsChannel): NewsChannelTransformer;
	public static resolve(value: Discord.TextChannel): TextChannelTransformer;
	public static resolve(value: Discord.VoiceChannel): VoiceChannelTransformer;
	public static resolve(value: Discord.GuildChannel): GuildChannelTransformer;
	public static resolve(value: Discord.DMChannel): DMChannelTransformer;
	public static resolve(value: Discord.Channel): ChannelTransformer;
	public static resolve(value: Discord.GuildMember): GuildMemberTransformer;
	public static resolve(value: Discord.Guild): GuildTransformer;
	public static resolve(value: Discord.Base): Transformer<Discord.Base, FlattenedBase> {
		if (!(value instanceof Discord.Base)) throw new TypeError(`Expected a structure extending base, got: ${new Type(value)}`);
		if (value instanceof Discord.User) return new UserTransformer(value);
		if (value instanceof Discord.Role) return new RoleTransformer(value);
		if (value instanceof Discord.Channel) return this._resolveChannel(value);
		if (value instanceof Discord.GuildMember) return new GuildMemberTransformer(value);
		if (value instanceof Discord.Guild) return new GuildTransformer(value);
		throw new TypeError(`Could not resolve ${new Type(value)} into a transformer`);
	}

	private static _resolveChannel(channel: Discord.NewsChannel): NewsChannelTransformer;
	private static _resolveChannel(channel: Discord.TextChannel): TextChannelTransformer;
	private static _resolveChannel(channel: Discord.VoiceChannel): VoiceChannelTransformer;
	private static _resolveChannel(channel: Discord.GuildChannel): GuildChannelTransformer;
	private static _resolveChannel(channel: Discord.DMChannel): DMChannelTransformer;
	private static _resolveChannel(channel: Discord.Channel): ChannelTransformer;
	private static _resolveChannel(channel: Discord.Channel): ChannelTransformer {
		if (channel.type === 'news') return new NewsChannelTransformer(channel as Discord.NewsChannel);
		if (channel.type === 'text') return new TextChannelTransformer(channel as Discord.TextChannel);
		if (channel.type === 'voice') return new VoiceChannelTransformer(channel as Discord.VoiceChannel);
		if ('guild' in channel) return new GuildChannelTransformer(channel as Discord.GuildChannel);
		if (channel.type === 'dm') return new DMChannelTransformer(channel as Discord.DMChannel);
		return new ChannelTransformer(channel);
	}

}

export class UserTransformer extends Transformer<Discord.User, FlattenedUser> {

	public transform(): FlattenedUser {
		return {
			id: this.internal.id,
			bot: this.internal.bot,
			username: this.internal.username,
			discriminator: this.internal.discriminator,
			avatar: this.internal.avatar
		};
	}

}

export class RoleTransformer extends Transformer<Discord.Role, FlattenedRole> {

	public transform(): FlattenedRole {
		return {
			id: this.internal.id,
			guildID: this.internal.guild.id,
			name: this.internal.name,
			color: this.internal.color,
			hoist: this.internal.hoist,
			rawPosition: this.internal.rawPosition,
			permissions: this.internal.permissions.bitfield,
			managed: this.internal.managed,
			mentionable: this.internal.mentionable
		};
	}

}

export class ChannelTransformer extends Transformer<Discord.Channel, FlattenedChannel> {

	public transform(): FlattenedChannel {
		return {
			id: this.internal.id,
			type: this.internal.type as FlattenedChannel['type'],
			createdTimestamp: this.internal.createdTimestamp
		};
	}

}

export class GuildChannelTransformer extends Transformer<Discord.GuildChannel, FlattenedGuildChannel> {

	public transform(): FlattenedGuildChannel {
		return {
			id: this.internal.id,
			type: this.internal.type as FlattenedGuildChannel['type'],
			guildID: this.internal.guild.id,
			name: this.internal.name,
			rawPosition: this.internal.rawPosition,
			parentID: this.internal.parentID,
			permissionOverwrites: [...this.internal.permissionOverwrites.entries()],
			createdTimestamp: this.internal.createdTimestamp
		};
	}

}

export class NewsChannelTransformer extends Transformer<Discord.NewsChannel, FlattenedNewsChannel> {

	public transform(): FlattenedNewsChannel {
		return {
			id: this.internal.id,
			type: this.internal.type as FlattenedNewsChannel['type'],
			guildID: this.internal.guild.id,
			name: this.internal.name,
			rawPosition: this.internal.rawPosition,
			parentID: this.internal.parentID,
			permissionOverwrites: [...this.internal.permissionOverwrites.entries()],
			topic: this.internal.topic,
			nsfw: this.internal.nsfw,
			createdTimestamp: this.internal.createdTimestamp
		};
	}

}

export class TextChannelTransformer extends Transformer<Discord.TextChannel, FlattenedTextChannel> {

	public transform(): FlattenedTextChannel {
		return {
			id: this.internal.id,
			type: this.internal.type as FlattenedTextChannel['type'],
			guildID: this.internal.guild.id,
			name: this.internal.name,
			rawPosition: this.internal.rawPosition,
			parentID: this.internal.parentID,
			permissionOverwrites: [...this.internal.permissionOverwrites.entries()],
			topic: this.internal.topic,
			nsfw: this.internal.nsfw,
			rateLimitPerUser: this.internal.rateLimitPerUser,
			createdTimestamp: this.internal.createdTimestamp
		};
	}

}

export class VoiceChannelTransformer extends Transformer<Discord.VoiceChannel, FlattenedVoiceChannel> {

	public transform(): FlattenedVoiceChannel {
		return {
			id: this.internal.id,
			type: this.internal.type as FlattenedVoiceChannel['type'],
			guildID: this.internal.guild.id,
			name: this.internal.name,
			rawPosition: this.internal.rawPosition,
			parentID: this.internal.parentID,
			permissionOverwrites: [...this.internal.permissionOverwrites.entries()],
			bitrate: this.internal.bitrate,
			userLimit: this.internal.userLimit,
			createdTimestamp: this.internal.createdTimestamp
		};
	}

}

export class DMChannelTransformer extends Transformer<Discord.DMChannel, FlattenedDMChannel> {

	public transform(): FlattenedDMChannel {
		return {
			id: this.internal.id,
			type: this.internal.type as FlattenedDMChannel['type'],
			recipient: this.internal.recipient.id,
			createdTimestamp: this.internal.createdTimestamp
		};
	}

}

export class GuildMemberTransformer extends Transformer<Discord.GuildMember, FlattenedGuildMember> {

	public transform(): FlattenedGuildMember {
		return {
			id: this.internal.id,
			guildID: this.internal.guild.id,
			user: new UserTransformer(this.internal.user).transform(),
			joinedTimestamp: this.internal.joinedTimestamp,
			premiumSinceTimestamp: this.internal.premiumSinceTimestamp,
			roles: this.internal.roles.map((role): FlattenedRole => new RoleTransformer(role).transform())
		};
	}

}

export class GuildTransformer extends Transformer<Discord.Guild, FlattenedGuild> {

	public transform(): FlattenedGuild {
		return {
			id: this.internal.id,
			available: this.internal.available,
			channels: this.internal.channels.map((chan): FlattenedGuildChannel => Transformer.resolve(chan).transform()),
			roles: this.internal.roles.map((role): FlattenedRole => new RoleTransformer(role).transform()),
			name: this.internal.name,
			icon: this.internal.icon,
			splash: this.internal.splash,
			region: this.internal.region,
			features: this.internal.features,
			applicationID: this.internal.applicationID,
			afkTimeout: this.internal.afkTimeout,
			afkChannelID: this.internal.afkChannelID,
			systemChannelID: this.internal.systemChannelID,
			embedEnabled: this.internal.embedEnabled,
			premiumTier: this.internal.premiumTier,
			premiumSubscriptionCount: this.internal.premiumSubscriptionCount,
			verificationLevel: this.internal.verificationLevel,
			explicitContentFilter: this.internal.explicitContentFilter,
			mfaLevel: this.internal.mfaLevel,
			joinedTimestamp: this.internal.joinedTimestamp,
			defaultMessageNotifications: this.internal.defaultMessageNotifications,
			vanityURLCode: this.internal.vanityURLCode,
			description: this.internal.description,
			banner: this.internal.banner,
			ownerID: this.internal.ownerID
		};
	}

}

export interface FlattenedBase {
	id: string;
}

export interface FlattenedUser extends FlattenedBase {
	bot: boolean;
	username: string;
	discriminator: string;
	avatar: string | null;
}


export interface FlattenedRole extends FlattenedBase {
	id: string;
	guildID: string;
	name: string;
	color: number;
	hoist: boolean;
	rawPosition: number;
	permissions: number;
	managed: boolean;
	mentionable: boolean;
}

export interface FlattenedChannel extends FlattenedBase {
	type: 'dm' | 'text' | 'voice' | 'category' | 'news' | 'store' | 'unknown';
	createdTimestamp: number;
}

export interface FlattenedGuildChannel extends FlattenedChannel {
	type: 'text' | 'voice' | 'category' | 'news' | 'store' | 'unknown';
	guildID: string;
	name: string;
	rawPosition: number;
	parentID: string | null;
	permissionOverwrites: [string, Discord.PermissionOverwrites][];
}

export interface FlattenedNewsChannel extends FlattenedGuildChannel {
	type: 'news';
	topic: string;
	nsfw: boolean;
}

export interface FlattenedTextChannel extends FlattenedGuildChannel {
	type: 'text';
	topic: string;
	nsfw: boolean;
	rateLimitPerUser: number;
}

export interface FlattenedVoiceChannel extends FlattenedGuildChannel {
	type: 'voice';
	bitrate: number;
	userLimit: number;
}

export interface FlattenedDMChannel extends FlattenedChannel {
	type: 'dm';
	recipient: string;
}

export interface FlattenedGuildMember extends FlattenedBase {
	id: string;
	guildID: string;
	user: FlattenedUser;
	joinedTimestamp: number | null;
	premiumSinceTimestamp: number | null;
	roles: FlattenedRole[];
}

export interface FlattenedGuild extends FlattenedBase {
	available: boolean;
	channels: FlattenedGuildChannel[];
	roles: FlattenedRole[];
	name: string;
	icon: string | null;
	splash: string | null;
	region: string;
	features: Discord.GuildFeatures[];
	applicationID: string;
	afkTimeout: number;
	afkChannelID: string | null;
	systemChannelID: string | null;
	embedEnabled: boolean;
	premiumTier: number;
	premiumSubscriptionCount: number | null;
	verificationLevel: number;
	explicitContentFilter: number;
	mfaLevel: number;
	joinedTimestamp: number;
	defaultMessageNotifications: number | 'ALL' | 'MENTIONS';
	vanityURLCode: string | null;
	description: string | null;
	banner: string | null;
	ownerID: string;
}
