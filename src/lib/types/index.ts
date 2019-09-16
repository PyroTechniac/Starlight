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
	Log = 'log',
	CommandError = 'commandError'
}

export interface RateLimitInfo {
	timeout: number;
	limit: number;
	method: string;
	path: string;
	route: string;
}
