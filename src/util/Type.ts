import { Constructable } from 'discord.js';

require('v8').setFlagsFromString('--allow-natives-syntax');
const getPromiseDetails = require('vm').runInThisContext(
    'p => p instanceof Promise ? { status: %PromiseStatus(p), result: %PromiseResult(p) } : null;'
);


export class Type {
    public is: string;
    private childKeys: Map<string, Type> = new Map();
    private childValues: Map<string, Type> = new Map();
    public constructor(public value: any, private parent: Type = null) {
        this.is = (this.constructor as typeof Type).resolve(value);
    }

    private get childTypes(): string {
        if (!this.childValues.size) return '';
        return `<${(this.childKeys.size ? `${(this.constructor as typeof Type).list(this.childKeys)}, ` : '') + (this.constructor as typeof Type).list(this.childValues)}>`;
    }

    public toString(): string {
        return '';
    }

    private *parents() {
        let current = this; // eslint-disable-line
        // @ts-ignore
        while (current = current.parent) yield current;
    }

    private check() {
        if (Object.isFrozen(this)) return;
        const promise = getPromiseDetails(this.value);
        if (typeof this.value === 'object' && this.isCircular()) this.is = `[Circular:${this.is}]`;
        else if (promise && promise.status) this.addValue(promise.result);
        else if (this.value instanceof Map) for (const entry of this.value) this.addEntry(entry);
        else if (Array.isArray(this.value) || this.value instanceof Set) for (const value of this.value) this.addValue(value);
        else if (this.is === 'Object') this.is = 'any';
        Object.freeze(this);
    }

    private isCircular(): boolean {
        for (const parent of this.parents()) if (parent.value === this.value) return true;
        return false;
    }

    private addValue(value: any) {
        const child = new (this.constructor() as Constructable<Type>)();
        this.childValues.set(child.is, child);
    }

    private addEntry([key, value]: [string, any]) {
        const child = new (this.constructor() as Constructable<Type>)();
        this.childKeys.set(child.is, child);
        this.addValue(value);
    }

    public static resolve(value) {
        const type = typeof value;
        switch (type) {
        case 'object': return value === null ? 'null' : value.constructor ? value.constructor.name : 'any';
        case 'function': return `${value.constructor.name}(${value.length}-arity)`;
        case 'undefined': return 'void';
        default: return type;
        }
    }

    private static list(values: Map<string, Type>): string {
        return values.has('any') ? 'any' : [...values.values()].sort().join(' | ');
    }
}
