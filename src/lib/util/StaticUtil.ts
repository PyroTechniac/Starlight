import { Constructable } from 'discord.js';
import { AnyObj } from '../interfaces';
import { promisify } from 'util';
import { exec } from 'child_process';
import { StarlightClient } from '../Client';

const zws = String.fromCharCode(8203);
let sensitivePattern: RegExp;
const TOTITLECASE = /[A-Za-zÀ-ÖØ-öø-ÿ]\S*/g;
const REGEXPESC = /[-/\\^$*+?.()|[\]{}]/g;

export class Util {
    public static PRIMITIVE_TYPES: string[] = ['string', 'boolean', 'bigint', 'number']

    public static sleep = promisify(setTimeout);

    public static exec = promisify(exec);

    public static titleCaseVariants = {
        textchannel: 'TextChannel',
        voicechannel: 'VoiceChannel',
        categorychannel: 'CategoryChannel',
        guildmember: 'GuildMember'
    }

    public static clean(text: string): string {
        return text.replace(sensitivePattern, 'Unavailable').replace(/`/g, `\`${zws}`).replace(/@/g, `@${zws}`);
    }

    public static initClean(client: StarlightClient): void {
        sensitivePattern = new RegExp(Util.regExpEsc(client.token), 'gi');
    }

    public static isClass(input: any): boolean {
        return typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class';
    }

    public static regExpEsc(str: string): string {
        return str.replace(REGEXPESC, '\\$&');
    }

    public static deepClone(source: any): any {
        // Check if it's a primitive (with exception of function and null, which is typeof object)
        if (source === null || this.isPrimitive(source)) return source;
        if (Array.isArray(source)) {
            const output: any[] = [];
            for (const value of source) output.push(this.deepClone(value));
            return output;
        }
        if (this.isObject(source)) {
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

    public static mergeDefault<T>(def: AnyObj, given: AnyObj): T {
        if (!given) return this.deepClone(def);
        for (const key in def) {
            if (typeof given[key] === 'undefined') given[key] = this.deepClone(def[key]);
            else if (this.isObject(given[key])) given[key] = this.mergeDefault(def[key], given[key]);
        }

        return given as any;
    }

    public static isObject(input: any): boolean {
        return input && input.constructor === Object;
    }

    public static isPrimitive(input: any): input is string | boolean | bigint | number {
        return this.PRIMITIVE_TYPES.includes(typeof input);
    }
}