export interface BTFProviderOptions {
	baseDirectory?: string;
}


export type Constructor<T> = new (...args: any[]) => T;


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

export interface ModLogJSONData {
	guild: string;
	case: number | null;
	type: ModLogType | null;
	user: ModLogUserInfo | null;
	moderator: ModLogUserInfo | null;
	reason: string | null;
}

export enum ModLogType {
	Kick,
	Ban,
	Softban,
	Mute,
	VoiceKick,
	Appeal
}

export interface ModLogUserInfo {
	avatar: string;
	id: string;
	tag: string;
}

export interface RateLimitInfo {
	timeout: number;
	limit: number;
	method: string;
	path: string;
	route: string;
}
