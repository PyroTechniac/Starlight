import {Constructable} from 'discord.js';

export class Util {
    public static PRIMITIVE_TYPES: string[] = ['string', 'boolean', 'bigint', 'number']

    public static deepClone<T>(source: T): T {
        if (source === null || this.isPrimitive(source)) return source;
        if (source instanceof Array) {
            const output: T[][] = [];
            for (const value of source) output.push(this.deepClone(value));
            return output as any;
        }
        if (source instanceof Map) {
            const output = new (source.constructor() as Constructable<Map<any, any>>)();
            for (const [key, value] of source.entries()) output.set(key, this.deepClone(value));
            return output as any;
        }
        if (source instanceof Set) {
            const output = new (source.constructor() as Constructable<Set<any>>)();
            for (const value of source.values()) output.add(this.deepClone(value));
            return output as any;
        }
        return source;
    }

    public static isObject(input: any): boolean {
        return input && input.constructor === Object;
    }

    public static isPrimitive(input: any): input is string | boolean | bigint | number {
        return this.PRIMITIVE_TYPES.includes(typeof input);
    }
}