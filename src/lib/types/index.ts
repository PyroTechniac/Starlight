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

export interface ModLogModerator {
	id: string;
	tag: string;
	avatar: string;
}

export enum ModLogType {
	Ban = 'ban',
	Unban = 'unban',
	Warn = 'warn',
	Kick = 'kick',
	Softban = 'softban',
	Unknown = 'unknown'
}

export enum ModLogColor {
	Ban = 16724253,
	Unban = 1822618,
	Warn = 16564545,
	Kick = 16573465,
	Softban = 15014476,
	Unknown = 16777215
}

export namespace ModLogColor { // eslint-disable-line @typescript-eslint/no-namespace, no-redeclare
	export const resolve = (type: ModLogType): ModLogColor => {
		switch (type) {
			case 'ban': return ModLogColor.Ban;
			case 'unban': return ModLogColor.Unban;
			case 'warn': return ModLogColor.Warn;
			case 'kick': return ModLogColor.Kick;
			case 'softban': return ModLogColor.Softban;
			case 'unknown':
			default: return ModLogColor.Unknown;
		}
	};
}

export interface ModLogJSON {
	guild: string;
	type: ModLogType | null;
	user: ModLogUser | null;
	moderator: ModLogModerator | null;
	reason: string | null;
	case: number | null;
}

export interface ModLogUser {
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
