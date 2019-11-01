import { PieceLanguageJSON } from 'klasa';

export interface RawDiscordPacket {
	t?: string;
}

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

export interface APIWebhookData {
	id: string;
	guild_id?: string;
	channel_id: string;
	user?: APIUserData;
	name: string | null;
	avatar: string | null;
	token: string;
}

export interface APIGuildMemberPartial {
	nick?: string;
	roles: string[];
	joined_at: string;
	deaf: boolean;
	mute: boolean;
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

export interface PieceExtendedLanguageJSON extends PieceLanguageJSON {
	translations: TranslationHelperJSON;
}

export interface UserAuthObject {
	token: string;
	user_id: string;
}

export interface BanInfo {
	user: string;
	reason?: string;
}

export interface ContentNodeDefaults {
	callback: boolean;
	options: boolean;
	fetchType: boolean;
}

export interface ReminderTaskData {
	user: string;
	content: string;
}

export interface ReferredPromise<T> {
	promise: Promise<T>;
	resolve(value?: T): void;
	reject(error?: Error): void;
}

export interface IdKeyed<K> {
	id: K;
}

export interface GetFn<K, V> {
	(key: K): Promise<V>;
}

export interface GetAllFn<K, V> {
	(keys: K[]): Promise<V[]>;
}

export interface FSProvider {
	baseDirectory: string;
	resolve: (...args: string[]) => string;
}
