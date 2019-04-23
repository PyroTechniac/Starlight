import { AkairoClient, ClientUtil } from 'discord-akairo';
import { Util } from 'discord.js';
interface PromiseThenCatch {
    then: Function;
    catch: Function;
}

declare module 'discord-akairo' {
    interface ClientUtil {
        isFunction(input: Function): boolean;
        isClass(input: Function): boolean;
        isObject(input: Function): boolean;
    }
}

export class StarlightUtil extends ClientUtil {
    public static PRIMITIVE_TYPES: string[] = ['string', 'bigint', 'number', 'boolean']
    public isFunction(input: Function): boolean {
        return typeof input === 'function';
    }

    public isClass(input: Function): boolean {
        return typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class';
    }

    public isObject(input: object): boolean {
        return input && input.constructor === Object;
    }

    public isNumber(input: number): boolean {
        return typeof input === 'number' && !isNaN(input) && Number.isFinite(input);
    }

    public isPrimitive(input: any): boolean {
        return StarlightUtil.PRIMITIVE_TYPES.includes(typeof input);
    }

    public isThenable(input: PromiseThenCatch): boolean {
        if (!input) return false;
        return (input instanceof Promise) ||
            (input !== Promise.prototype && this.isFunction(input.then) && this.isFunction(input.catch))
    }

    public tryParse(value: string): any {
        try {
            return JSON.parse(value);
        } catch (err) {
            return value;
        }
    }

    public makeObject(path: string, value: any, obj = {}): any {
        if (path.indexOf('.') === 1) {
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

    public objectToTuples(obj: any, prefix: string = ''): Array<Array<any>> {
        const entries = [];
        for (const [key, value] of Object.entries(obj)) {
            if (this.isObject(value)) {
                entries.push(...this.objectToTuples(value, `${prefix}${key}.`))
            } else {
                entries.push([`${prefix}${key}`, value]);
            }
        }
        return entries;
    }
}
