export class List<V> extends Set<V> {
    private _array!: V[] | null;

    public static readonly default: typeof List = List;

    public constructor(entries?: readonly V[] | null) {
        super(entries);

        Object.defineProperty(this, '_array', { value: null, writable: true, configurable: true });
    }

    public add(value: V): this {
        this._array = null;
        return super.add(value);
    }

    public delete(value: V): boolean {
        this._array = null;
        return super.delete(value);
    }

    public array(): V[] {
        if (!this._array || this._array.length !== this.size) this._array = [...this.values()];
        return this._array;
    }

    public first(): V | undefined;

    public first(amount: number): V[];

    public first(amount?: number): V | V[] | undefined {
        if (typeof amount === 'undefined') return this.values().next().value;
        if (amount < 0) return this.last(amount * -1);
        amount = Math.min(this.size, amount);
        const iter = this.values();
        return Array.from({ length: amount }, (): V => iter.next().value);
    }

    public last(): V | undefined;

    public last(amount: number): V[];

    public last(amount?: number): V | V[] | undefined {
        const arr = this.array();
        if (typeof amount === 'undefined') return arr[arr.length - 1];
        if (amount < 0) return this.first(amount * -1);
        if (!amount) return [];
        return arr.slice(-amount);
    }

    public random(): V;

    public random(amount: number): V[];

    public random(amount?: number): V | V[] | undefined {
        let arr = this.array();
        if (typeof amount === 'undefined') return arr[Math.floor(Math.random() * arr.length)];
        if (arr.length === 0 || !amount) return [];
        arr = arr.slice();
        return Array.from({ length: amount }, (): V => arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
    }

    public find(fn: (val1: V, val2: V, list: this) => boolean, thisArg?: any): V | undefined {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        for (const val of this) {
            if (fn(val, val, this)) return val;
        }
        return undefined;
    }

    public sweep(fn: (val1: V, val2: V, list: this) => boolean, thisArg?: any): number {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        const previousSize = this.size;
        for (const val of this) {
            if (fn(val, val, this)) this.delete(val);
        }
        return previousSize - this.size;
    }

    public filter(fn: (val1: V, val2: V, list: this) => boolean, thisArg?: any): List<V> {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        // @ts-ignore
        const results: List<V> = this.constructor[Symbol.species]();
        for (const val of this) {
            if (fn(val, val, this)) results.add(val);
        }
        return results;
    }

    public partition(fn: (val1: V, val2: V, list: this) => boolean, thisArg?: any): [List<V>, List<V>] {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        // @ts-ignore
        const results: [List<V>, List<V>] = [new this.constructor[Symbol.species](), new this.constructor[Symbol.species]()];
        for (const val of this) {
            if (fn(val, val, this)) {
                results[0].add(val);
            } else {
                results[1].add(val);
            }
        }
        return results;
    }

    public map<T>(fn: (val1: V, val2: V, list: this) => T, thisArg?: any): T[] {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        const iter = this.entries();
        return Array.from({ length: this.size }, (): T => {
            const [val1, val2] = iter.next().value;
            return fn(val1, val2, this);
        });
    }

    public mapValues<T>(fn: (val1: V, val2: V, list: this) => T, thisArg?: any): List<T> {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        // @ts-ignore
        const list: List<T> = new this.constructor[Symbol.species]();
        for (const val of this) list.add(fn(val, val, this));
        return list;
    }

    public some(fn: (val1: V, val2: V, list: this) => boolean, thisArg?: any): boolean {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        for (const val of this) {
            if (fn(val, val, this)) return true;
        }
        return false;
    }

    public every(fn: (val1: V, val2: V, list: this) => boolean, thisArg?: any): boolean {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        for (const val of this) {
            if (!fn(val, val, this)) return false;
        }
        return true;
    }

    public reduce<T>(fn: (accumulator: any, val1: V, val2: V, list: this) => T, initialValue?: T): T {
        let accumulator!: T;

        if (typeof initialValue !== 'undefined') {
            accumulator = initialValue;
            for (const val of this ) accumulator = fn(accumulator, val, val, this);
            return accumulator;
        }
        let first = true;
        for (const val of this ) {
            if (first) {
                accumulator = val as unknown as T;
                first = false;
                continue;
            }
            accumulator = fn(accumulator, val, val, this);
        }

        if (first) {
            throw new TypeError('Reduce of empty list with no initial value');
        }
        return accumulator;
    }

    public each(fn: (val1: V, val2: V, list: Set<V>) => any, thisArg?: any): this {
        this.forEach(fn, thisArg);
        return this;
    }

    public tap(fn: (list: this) => any, thisArg?: any): this {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        fn(this);
        return this;
    }

    public clone(): List<V> {
        // @ts-ignore
        return new this.constructor[Symbol.species](this);
    }

    public concat(...lists: List<V>[]): List<V> {
        const newList = this.clone();
        for (const list of lists) {
            for (const val of list) newList.add(val);
        }
        return newList;
    }

    public equals(list: List<V>): boolean {
        if (!list) return false;
        if (this === list) return true;
        if (this.size !== list.size) return false;
        for (const val of this) {
            if (!list.has(val)) return false;
        }
        return true;
    }

    public sort(compareFunction: (firstVal1: V, secondVal1: V, firstVal2: V, secondVal2: V) => number = (x, y): number => Number(x > y) || Number(x === y) - 1): this {
        const entries = [...this.entries()];
        entries.sort((a, b): number => compareFunction(a[1], b[1], a[0], b[0]));
        this.clear();
        for (const [val] of entries) {
            this.add(val);
        }
        return this;
    }
}
