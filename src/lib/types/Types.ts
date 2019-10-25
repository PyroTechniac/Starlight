import { CachedClass } from './Interfaces';

export type Constructor<T = {}> = new (...args: any[]) => T;

export type CacheableClass<C> = C & CachedClass;
