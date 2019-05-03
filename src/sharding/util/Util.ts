import { AnyObj } from '../../util';
import { promisify } from 'util';
import { Constructable } from 'discord.js';

export class Util {
    public static PRIMITIVE_TYPES: string[] = ['string', 'bigint', 'number', 'boolean'];

    public static chunk<T>(entries: T[], chunkSize: number): T[][] {
        const result = [];
        const amount = Math.floor(entries.length / chunkSize);
        const mod = entries.length % chunkSize;

        for (let i = 0; i < chunkSize; i++) {
            result[i] = entries.splice(0, i < mod ? amount + 1 : amount);
        }

        return result;
    }

    public static deepClone(source: any): any {
        if (source === null || Util.isPrimitive(source)) return source;
        if (Array.isArray(source)) {
            const output = [];
            for (const value of source) output.push(Util.deepClone(value));
            return output;
        }
        if (Util.isObject(source)) {
            const output: AnyObj = {};
            for (const [key, value] of Object.entries(source)) output[key] = Util.deepClone(value);
            return output;
        }
        if (source instanceof Map) {
            const output = new (source.constructor() as Constructable<Map<any, any>>)();
            for (const [key, value] of source.entries()) output.set(key, Util.deepClone(value));
            return output;
        }
        if (source instanceof Set) {
            const output = new (source.constructor() as Constructable<Set<any>>)();
            for (const value of source.values()) output.add(Util.deepClone(value));
            return output;
        }
        return source;
    }

    public static mergeDefault<T>(def: AnyObj, given: AnyObj): T {
        if (!given) return Util.deepClone(def);
        for (const key in def) {
            if (typeof given[key] === 'undefined') given[key] = Util.deepClone(def[key]);
            else if (Util.isObject(given[key])) given[key] = Util.mergeDefault(def[key], given[key]);
        }

        return given as any;
    }

    public static isPrimitive(value: any): value is string | bigint | number | boolean {
        return Util.PRIMITIVE_TYPES.includes(typeof value);
    }

    public static isObject(input: any) {
        return input && input.constructor === Object;
    }

    public static sleep(duration: number) {
        return promisify(setTimeout)(duration);
    }

    public static calcShards(shards: number, guildsPerShard: number): number {
        return Math.ceil(shards * (1000 / guildsPerShard));
    }
}
