export type Constructor<T = {}> = new (...args: any[]) => T;

export type AnyObject = Record<keyof any, unknown> | {};

export type FetchType = 'result' | 'json' | 'buffer' | 'text';
