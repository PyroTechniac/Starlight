import { PieceLanguageJSON, PieceOptions, CommandOptions } from 'klasa';

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

export interface IPCMonitorOptions extends PieceOptions { }

export interface WebSocketStatistics {
	heapTotal: number;
	heapUsed: number;
	ping: [number, number, number];
	status: number;
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

export interface BankCommandOptions extends CommandOptions {
	authenticated?: boolean;
}