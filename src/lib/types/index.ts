export type Constructor<T> = new (...args: any[]) => T;


export enum Events {
	ERROR = 'error',
	WARN = 'warn',
	DEBUG = 'debug',
	VERBOSE = 'verbose',
	WTF = 'wtf',
	WARNING = 'warning',
	KLASA_READY = 'klasaReady',
	LOG = 'log'
}
