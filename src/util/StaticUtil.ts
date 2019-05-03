import { AkairoClient } from 'discord-akairo';
import { Constructable, Guild, GuildChannel, GuildMember, Message } from 'discord.js';

const TOTITLECASE = /[A-Za-zÀ-ÖØ-öø-ÿ]\S*/g;
export type GuildResolvable = Guild | Message | GuildChannel;

export const titleCaseVariants = {
    textchannel: 'TextChannel',
    voicechannel: 'VoiceChannel',
    categorychannel: 'CategoryChannel',
    guildmember: 'GuildMember'
};

export interface AnyObj {
    [key: string]: any;
}

export const PRIMITIVE_TYPES: string[] = ['string', 'boolean', 'bigint', 'number'];

export function isPrimitive(value: any): value is string | boolean | number | bigint {
    return PRIMITIVE_TYPES.includes(typeof value);
}

export function isObject(input: any): boolean {
    return input && input.constructor === Object;
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
        for (const [key, value] of source.entries()) output.set(key, deepClone(value));
        return output;
    }
    if (source instanceof Set) {
        const output = new (source.constructor() as Constructable<Set<any>>)();
        for (const value of source.values()) output.add(deepClone(value));
        return output;
    }
    return source;
}

export function mergeDefault<T>(def: AnyObj, given: AnyObj): T {
    if (!given) return deepClone(def);
    for (const key in def) {
        if (typeof given[key] === 'undefined') given[key] = deepClone(def[key]);
        else if (isObject(given[key])) given[key] = mergeDefault(def[key], given[key]);
    }

    return given as any;
}

export function isFunction(input: any): boolean {
    return typeof input === 'function';
}

export function objectToTuples(object: Record<string, any>, prefix: string = ''): any[][] {
    const entries = [];
    for (const [key, value] of Object.entries(object)) {
        if (isObject(value)) {
            entries.push(...objectToTuples(value, `${prefix}${key}.`));
        } else {
            entries.push([`${prefix}${key}`, value]);
        }
    }
    return entries;
}

export function toTitleCase(str: string): string {
    return str.replace(TOTITLECASE, txt => titleCaseVariants[txt] || txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export function mergeObjects(objTarget: AnyObj, objSource: AnyObj): AnyObj {
    for (const key in objSource) objTarget[key] = isObject(objSource[key]) ? mergeObjects(objTarget[key], objSource[key]) : objSource[key];
    return objTarget;
}

export function makeObject(path: string, value: any, obj: AnyObj = {}): any {
    if (path.indexOf('.') === -1) {
        obj[path] = value;
    } else {
        const route = path.split('.');
        const lastKey = route.pop();
        let reference = obj;
        for (const key of route) {
            if (!reference[key]) reference[key] = {};
            reference = reference[key];
        }
        reference[lastKey] = value;
    }
    return obj;
}

export function resolveGuild(client: AkairoClient, guild: GuildResolvable): Guild {
    const type = typeof guild;
    if (type === 'object' && guild !== null) {
        if (guild instanceof Guild) return guild;
        if ((guild instanceof GuildChannel) ||
            (guild instanceof GuildMember) ||
            (guild instanceof Message)) return guild.guild;
    } else if (type === 'string' && /^\d{17,19}$/.test(guild as unknown as string)) {
        return client.guilds.get(guild as unknown as string) || null;
    }
    return null;
}

export function isNumber(input: any): boolean {
    return typeof input === 'number' && !Number.isNaN(input) && Number.isFinite(input);
}
