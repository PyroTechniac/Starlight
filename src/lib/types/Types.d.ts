export type Constructor<T = {}> = new (...args: any[]) => T;

export type AnyObject = Record<keyof any, unknown> | {};

export type ArrayValues<T extends readonly unknown[]> = T[number];
