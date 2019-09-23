export interface BTFProviderOptions {
	baseDirectory?: string;
}

export type Constructor<T> = new (...args: any[]) => T;

export interface RawDiscordPacket {
	t?: string;
}

export enum Events {
	Error = 'error',
	Warn = 'warn',
	Debug = 'debug',
	Verbose = 'verbose',
	Wtf = 'wtf',
	Warning = 'warning',
	KlasaReady = 'klasaReady',
	Log = 'log'
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
