import { promisify } from 'util';
import { exec } from 'child_process';
import { Guild, GuildMember, GuildChannel, Message, Constructable } from 'discord.js';

import { AnyObj } from '../interfaces';

const zws = String.fromCharCode(8203);
let sensitivePattern;
const TOTITLECASE: RegExp = /[A-Za-zÀ-ÖØ-öø-ÿ]\S*/g;
const REGEXPESC: RegExp = /[-/\\^$*+?.()|[\]{}]/g;

export class Util {
    public static readonly PRIMITIVE_TYPES: string[] = ['string', 'bigint', 'number', 'boolean']

    public static codeBlock(lang: string, expression: string): string {
        return `\`\`\`${lang}\n${expression || zws}\`\`\``;
    }

    public static deepClone(source: any): any {
        if (source === null || this.isPrimitive(source)) return source;
        if (Array.isArray(source)) {
            const output: any[] = [];
            for (const value of source) output.push(this.deepClone(value));
            return output;
        }
        if (this.isObject) {
            const output: AnyObj = {};
            for (const [key, value] of Object.entries(source)) output[key] = this.deepClone(value);
            return output;
        }
        if (source instanceof Map) {
            const output = new (source.constructor() as Constructable<Map<any, any>>)();
            for (const [key, value] of source.entries()) output.set(key, this.deepClone(value));
            return output;
        }
        if (source instanceof Set) {
            const output = new (source.constructor() as Constructable<Set<any>>)();
            for (const value of source.values()) output.add(this.deepClone(value));
            return output;
        }
        return source;
    }

    public static isObject(input: any): boolean {
        return input && input.constructor === Object;
    }

    public static isPrimitive(input: any): input is string | bigint | boolean | number {
        return this.PRIMITIVE_TYPES.includes(typeof input);
    }

    public static mergeDefault<T>(def: AnyObj, given: AnyObj): T {
        if (!given) return this.deepClone(def);
        for (const key in def) {
            if (typeof given[key] === 'undefined') given[key] = this.deepClone(def[key]);
            else if (this.isObject(given[key])) given[key] = this.mergeDefault(def[key], given[key]);
        }

        return given as any;
    }

    public static isClass(input: any): boolean {
        return typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class';
    }
}