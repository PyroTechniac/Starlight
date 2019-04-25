import { ClientUtil } from 'discord-akairo';

declare module 'discord-akairo' {
    interface ClientUtil {
        mergeDefault<T = Record<string, any>, S = Record<string, any>>(objDefaults: T, objSource: S): T & S;
        tryParse<T = Record<string, any>>(value: string): T | string;
        isThenable(input: any): boolean;
        isPrimitive(input: any): input is string | number | boolean;
        isObject(input: any): boolean;
        isNumber(input: any): input is number;
        isFunction(input: any): input is Function;
        isClass(input: any): input is Constructor<any>;
        deepClone<T = any>(source: T): T;
        arraysStrictEquals(arr1: any[], arr2: any[]): boolean;
        mergeObjects<T = Record<string, any>, S = Record<string, any>>(objTarget: T, objSource: S): T & S
    }
}

export class StarlightUtil extends ClientUtil {
    public mergeDefault<T = Record<string, any>, S = Record<string, any>>(def: T, given: S): T & S {
        if (!given) return this.deepClone(def) as any;
        for (const key in def) {
            // @ts-ignore
            if (typeof given[key] as any === 'undefined') given[key] = this.deepClone(def[key]);
            // @ts-ignore
            else if (this.isObject(given[key])) given[key] = this.mergeDefault(def[key], given[key]);
        }
        // @ts-ignore
        return given;
    }

    public deepClone<T = any>(source: T): T {
        if (source === null || this.isPrimitive(source)) return source;
        if (Array.isArray(source)) {
            const output = [];
            for (const value of source) output.push(this.deepClone(value));
            return output as unknown as T;
        }
        if (this.isObject(source as T)) {
            const output = {};
            for (const [key, value] of Object.entries(source)) output[key] = this.deepClone(value);
            return output as T;
        }
        if (source instanceof Map) {
            const output = new Map();
            for (const [key, value] of source.entries()) output.set(key, this.deepClone(value));
            return output as unknown as T;
        }
        if (source instanceof Set) {
            const output = new Set();
            for (const value of source.values()) output.add(this.deepClone(value));
            return output as unknown as T;
        }
        return source;
    }

    public static PRIMITIVE_TYPES: string[] = ['string', 'bigint', 'number', 'boolean']
    public isFunction(input: any): input is Function {
        return typeof input === 'function';
    }

    public isClass(input: any): input is Constructor<any> {
        return typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class';
    }

    public isObject(input: any): boolean {
        return input && input.constructor === Object;
    }

    public isNumber(input: any): input is number {
        return typeof input === 'number' && !isNaN(input) && Number.isFinite(input);
    }

    public isPrimitive(input: any): input is string | number | boolean {
        return StarlightUtil.PRIMITIVE_TYPES.includes(typeof input);
    }

    public isThenable(input: any): boolean {
        if (!input) return false;
        return (input instanceof Promise) ||
            (input !== Promise.prototype && this.isFunction(input.then) && this.isFunction(input.catch)); // eslint-disable-line
    }

    public tryParse<T = Record<string, any>>(value: string): T | string {
        try {
            return JSON.parse(value);
        } catch (err) {
            return value;
        }
    }

    public makeObject<T = Record<string, any>, S = Record<string, any>>(path: string, value: any, obj: Record<string, any> = {}): T & S {
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
        return obj as any;
    }

    public objectToTuples(obj: Record<string, any>, prefix: string = ''): Array<[string, any]> {
        const entries = [];
        for (const [key, value] of Object.entries(obj)) {
            if (this.isObject(value)) {
                entries.push(...this.objectToTuples(value, `${prefix}${key}.`));
            } else {
                entries.push([`${prefix}${key}`, value]);
            }
        }
        return entries;
    }

    public arrayStrictEquals(arr1: any[], arr2: any[]): boolean {
        if (arr1 === arr2) return true;
        if (arr1.length !== arr2.length) return false;

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    public mergeObjects<T = Record<string, any>, S = Record<string, any>>(objTarget: T = {} as T, objSource: S): T & S {
        // @ts-ignore
        for (const key in objSource) objTarget[key] = this.isObject(objSource[key]) ? this.mergeObjects(objTarget[key], objSource[key]) : objSource[key];
        return objTarget as T & S;
    }
}

interface Constructor<C> {
    new(...args: any[]): C;
}
