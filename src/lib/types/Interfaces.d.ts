export interface RateLimitInfo {
	timeout: number;
	limit: number;
	method: string;
	path: string;
	route: string;
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

export interface ReadTOMLOptions {
	encoding?: BufferEncoding;
	flag?: string | number;
}

export interface TranslationHelperJSON {
	language: string;
	translations: Record<string, string>;
	defaults: Record<string, string>;
}

export interface UserAuthObject {
	token: string;
	user_id: string;
}

export interface ContentNodeDefaults {
	callback: boolean;
	options: boolean;
	fetchType: boolean;
}

export interface ReferredPromise<T> {
	promise: Promise<T>;
	resolve(value?: T): void;
	reject(error?: Error): void;
}

export interface FSProvider {
	baseDirectory: string;
	resolve: (...args: string[]) => string;
}

export interface ParsedMyriadContent {
	language: string;
	code: string;
}