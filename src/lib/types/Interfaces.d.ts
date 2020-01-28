import { IdKeyed, RequestHandler } from '../structures/RequestHandler';
import { Guild } from 'discord.js';

export interface RateLimitInfo {
	timeout: number;
	limit: number;
	method: string;
	path: string;
	route: string;
}

export interface OAuthData {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	token_type: string;
}

export interface APIUserData {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	bot?: boolean;
	mfa_enabled?: boolean;
	locale?: string;
	verified?: boolean;
	email?: string;
}

export interface APIEmojiPartial {
	id: string | null;
	name: string;
	animated: boolean;
}

export interface APIEmojiData extends APIEmojiPartial {
	roles?: string[];
	user?: APIUserData;
	require_colons?: boolean;
	managed?: boolean;
}

export interface APIGuildMemberPartial {
	nick?: string;
	roles: string[];
	joined_at: string;
	deaf: boolean;
	mute: boolean;
}

export interface WSMessageReactionAdd {
	user_id: string;
	message_id: string;
	emoji: APIEmojiData;
	channel_id: string;
	guild_id: string;
}

export interface APIGuildMemberData extends APIGuildMemberPartial {
	user: APIUserData;
}

export interface WSGuildMemberAdd extends APIGuildMemberData {
	guild_id: string;
}

export interface WSGuildMemberRemove {
	user: APIUserData;
	guild_id: string;
}

export interface WSGuildMemberUpdate {
	user: APIUserData;
	roles: string[];
	nick: string | null;
	guild_id: string;
}

export interface TomlOptions {
	encoding?: string;
	mode?: number;
	flag?: string;
}

export interface YamlOptions {
	encoding?: string;
	mode?: number;
	flag?: string;
}

export interface BtfOptions {
	encoding?: string;
	mode?: number;
	flag?: string;
}

export interface ReadTOMLOptions {
	encoding?: BufferEncoding;
	flag?: string | number;
}

export interface ReadYAMLOptions {
	encoding?: BufferEncoding;
	flag?: string | number;
}

export interface UserAuthObject {
	token: string;
	user_id: string;
}

export interface ReferredPromise<T> {
	promise: Promise<T>;

	resolve(value?: T): void;

	reject(error?: Error): void;
}

export interface FSProvider {
	baseDirectory: string;
	extension: string;
}

export interface StatsGeneral {
	CHANNELS: string;
	GUILDS: string;
	NODE_JS: string;
	USERS: string;
	VERSION: string;
}

export interface StatsUptime {
	CLIENT: string;
	HOST: string;
	TOTAL: string;
}

export interface StatsUsage {
	CPU_LOAD: string;
	RAM_TOTAL: string;
	RAM_USED: string;
}

export interface FlagData {
	type: string | string[];
	aliases?: string[];
}

export interface CacheHandler<V extends IdKeyed<string>> {
	handler: RequestHandler<string, V>;

	request(id: string): Promise<V>;

	requestMany(ids: readonly string[]): Promise<V[]>;
}

export interface GuildCacheHandler<V extends IdKeyed<string>> extends CacheHandler<V> {
	readonly guild: Guild;
	kPromise: Promise<void> | null;

	requestAll(): Promise<void>;
}

export interface UserData {
	readonly avatar: string | null;
	readonly username: string;
	readonly discriminator: string;
}

export interface EmojiData {
	readonly animated: boolean;
	readonly id: string;
	readonly name: string;
}

export interface WSGuildCreate {
	preferred_locale: string;
	joined_at: string;
	premium_subscription_count: number;
	channels: WSChannelData[];
	features: any[];
	lazy: boolean;
	default_message_notifications: number;
	rules_channel_id: null;
	premium_tier: number;
	large: boolean;
	afk_channel_id: null;
	members: WSMemberData[];
	voice_states: any[];
	name: string;
	icon: null;
	owner_id: string;
	application_id: null;
	splash: null;
	mfa_level: number;
	afk_timeout: number;
	unavailable: boolean;
	system_channel_id: string;
	presences: WSPresenceData[];
	discovery_splash: null;
	banner: null;
	vanity_url_code: null;
	region: string;
	roles: WSRoleData[];
	description: null;
	member_count: number;
	emojis: any[];
	id: string;
	verification_level: number;
	explicit_content_filter: number;
	system_channel_flags: number;
}

export interface WSChannelData {
	user_limit?: number;
	type: number;
	position: number;
	permission_overwrites: WSPermissionOverwriteData[];
	name: string;
	id: string;
	bitrate?: number;
	topic?: null | string;
	rate_limit_per_user?: number;
	parent_id?: string;
	nsfw?: boolean;
	last_message_id?: string;
}

export interface WSPermissionOverwriteData {
	type: string;
	id: string;
	deny: number;
	allow: number;
}

export interface WSMemberData {
	user: WSUserData;
	roles: string[];
	premium_since?: null;
	nick?: null | string;
	mute: boolean;
	joined_at: string;
	hoisted_role: null | string;
	deaf: boolean;
}

export interface WSUserData {
	username: string;
	id: string;
	discriminator: string;
	bot?: boolean;
	avatar: string;
}

export interface WSPresenceData {
	user: WSPresenceUserData;
	status: string;
	game: WSActivityData | null;
	client_status: WSClientStatusData;
	activities: WSActivityData[];
}

export interface WSRoleData {
	position: number;
	permissions: number;
	name: string;
	mentionable: boolean;
	managed: boolean;
	id: string;
	hoist: boolean;
	color: number;
}

export interface WSActivityData {
	type: number;
	name: string;
	id: string;
	created_at: number;
}

export interface WSClientStatusData {
	web: string;
}

export interface WSPresenceUserData {
	id: string;
}

