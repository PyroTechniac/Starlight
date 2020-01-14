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

export interface Cacher<V> {
	request(id: string): Promise<V>;

	requestMany(ids: readonly string[]): Promise<V[]>;
}
