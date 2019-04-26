import { Constructable } from 'discord.js';
import { promisify } from 'util';

export interface AnyObj {
    [key: string]: any;
}

export const PRIMITIVE_TYPES: string[] = ['string', 'bigint', 'number', 'boolean'];

export function isPrimitive(value: any): value is string | bigint | number | boolean {
    return PRIMITIVE_TYPES.includes(typeof value);
}

export function chunk<T>(entries: T[], chunkSize: number): T[][] {
    const result = [];
    const amount: number = Math.floor(entries.length / chunkSize);
    const mod: number = entries.length % chunkSize;

    for (let i = 0; i < chunkSize; i++) {
        result[i] = entries.splice(0, i < mod ? amount + 1 : amount);
    }

    return result;
}

export function isObject(input: any) {
    return input && input.constructor === Object;
}

export function calcShards(shards: number, guildsPerShard: number): number {
    return Math.ceil(shards * (1000 / guildsPerShard));
}

export function deepClone(source: any): any {
    if (source === null || isPrimitive(source)) return source;
    if (Array.isArray(source)) {
        const output = [];
        for (const value of source) output.push(deepClone(value));
        return output;
    }
    if (isObject(source)) {
        const output: AnyObj = {};
        for (const [key, value] of Object.entries(source)) output[key] = deepClone(value);
        return output;
    }
    if (source instanceof Map) {
        const output = new (source.constructor() as Constructable<Map<any, any>>)();
        for (const [key, value] of source.entries()) output.set(key, value);
        return output;
    }
    if (source instanceof Set) {
        const output = new (source.constructor() as Constructable<Set<any>>)();
        for (const value of source.values()) output.add(deepClone(value));
        return output;
    }
    return source;
}

export function sleep(duration: number) {
    return promisify(setTimeout)(duration);
}

export function mergeDefault<T>(def: AnyObj, given: AnyObj): T {
    if (!given) return deepClone(def);
    for (const key in def) {
        if (typeof given[key] === 'undefined') given[key] = deepClone(def[key]);
        else if (isObject(given[key])) given[key] = mergeDefault(def[key], given[key]);
    }
}
