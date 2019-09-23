export interface ListConstructor {
	new(): List<unknown>;
	new <V>(entries?: ReadonlyArray<V> | null): List<V>;
	new <V>(iterable: Iterable<V>): List<V>;
	readonly prototype: List<unknown>;
	readonly [Symbol.species]: ListConstructor;
}

class List<V> extends Set<V> {

	public ['constructor']: typeof List;

	private _array!: V[] | null;

	public constructor(entries?: ReadonlyArray<V> | null) {
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
		const length = Math.min(this.size, amount);
		const iter = this.values();
		return Array.from({ length }, (): V => iter.next().value);
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
	public random(amount?: number): V | V[] {
		let arr = this.array();
		if (typeof amount === 'undefined') return arr[Math.floor(Math.random() * arr.length)];
		if (arr.length === 0 || !amount) return [];
		arr = arr.slice();
		return Array.from({ length: amount }, (): V => arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
	}

	public find(fn: (value: V, list: this) => boolean): V | undefined;
	public find<T>(fn: (this: T, value: V, list: this) => boolean, thisArg: T): V | undefined;
	public find(fn: (value: V, list: this) => boolean, thisArg?: unknown): V | undefined {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		for (const val of this) {
			if (fn(val, this)) return val;
		}

		return undefined;
	}

	public sweep(fn: (value: V, list: this) => boolean): number;
	public sweep<T>(fn: (this: T, value: V, list: this) => boolean, thisArg: T): number;
	public sweep(fn: (value: V, list: this) => boolean, thisArg?: unknown): number {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		const previousSize = this.size;
		for (const val of this) {
			if (fn(val, this)) this.delete(val);
		}

		return previousSize - this.size;
	}

	public filter(fn: (value: V, list: this) => boolean): this;
	public filter<T>(fn: (this: T, value: V, list: this) => boolean, thisArg: T): this;
	public filter(fn: (value: V, list: this) => boolean, thisArg?: unknown): this {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		const results = new this.constructor[Symbol.species]<V>() as this;
		for (const val of this) {
			if (fn(val, this)) results.add(val);
		}

		return results;
	}

	public partition(fn: (value: V, list: this) => boolean): [this, this];
	public partition<T>(fn: (this: T, value: V, list: this) => boolean, thisArg: T): [this, this];
	public partition(fn: (value: V, list: this) => boolean, thisArg?: unknown): [this, this] {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		const results: [this, this] = [new this.constructor[Symbol.species]<V>() as this, new this.constructor[Symbol.species]<V>() as this];
		for (const val of this) {
			if (fn(val, this)) results[0].add(val);
			else results[1].add(val);
		}
		return results;
	}

	public flatMap<T>(fn: (value: V, list: this) => List<T>): List<T>
	public flatMap<T, This>(fn: (this: This, value: V, list: this) => List<T>, thisArg: This): List<T>;
	public flatMap<T>(fn: (value: V, list: this) => List<T>, thisArg?: unknown): List<T> {
		const lists = this.map(fn, thisArg);
		return (new this.constructor[Symbol.species]<T>() as List<T>).concat(...lists);
	}

	public map<T>(fn: (value: V, list: this) => T): T[];
	public map<T, This>(fn: (this: This, value: V, list: this) => T, thisArg: This): T[];
	public map<T>(fn: (value: V, list: this) => T, thisArg?: unknown): T[] {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		const iter = this.values();
		return Array.from({ length: this.size }, (): T => {
			const { value } = iter.next();
			return fn(value, this);
		});
	}

	public mapValues<T>(fn: (value: V, list: this) => T): List<T>;
	public mapValues<T, This>(fn: (this: This, value: V, list: this) => T, thisArg: This): List<T>;
	public mapValues<T>(fn: (value: V, list: this) => T, thisArg?: unknown): List<T> {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		const list = new this.constructor[Symbol.species]<T>() as List<T>;
		for (const value of this) list.add(fn(value, this));
		return list;
	}

	public some(fn: (value: V, list: this) => boolean): boolean;
	public some<T>(fn: (this: T, value: V, list: this) => boolean, thisArg: T): boolean;
	public some(fn: (value: V, list: this) => boolean, thisArg?: unknown): boolean {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		for (const val of this) {
			if (fn(val, this)) return true;
		}

		return false;
	}

	public every(fn: (value: V, list: this) => boolean): boolean;
	public every<T>(fn: (this: T, value: V, list: this) => boolean, thisArg: T): boolean;
	public every(fn: (value: V, list: this) => boolean, thisArg?: unknown): boolean {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		for (const val of this) {
			if (!fn(val, this)) return false;
		}
		return true;
	}

	public reduce<T>(fn: (accumulator: T, value: V, list: this) => T, initialValue?: T): T {
		let accumulator!: T;

		if (typeof initialValue !== 'undefined') {
			accumulator = initialValue;
			for (const val of this) accumulator = fn(accumulator, val, this);
			return accumulator;
		}

		let first = true;
		for (const val of this) {
			if (first) {
				accumulator = val as unknown as T;
				first = false;
				continue;
			}

			accumulator = fn(accumulator, val, this);
		}

		if (first) {
			throw new TypeError('Reduce of empty list with no initial value');
		}

		return accumulator;
	}

	public each(fn: (val1: V, val2: V, list: this) => void): this;
	public each<T>(fn: (this: T, val1: V, val2: V, list: this) => void, thisArg: T): this;
	public each(fn: (val1: V, val2: V, list: this) => void, thisArg?: unknown): this {
		this.forEach(fn as (val1: V, val2: V, set: Set<V>) => void, thisArg);
		return this;
	}

	public tap(fn: (list: this) => void): this;
	public tap<T>(fn: (this: T, list: this) => void, thisArg: T): this;
	public tap(fn: (list: this) => void, thisArg?: unknown): this {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		fn(this);
		return this;
	}

	public clone(): this {
		return new this.constructor[Symbol.species](this) as this;
	}

	public concat(...lists: List<V>[]): this {
		const newList = this.clone();
		for (const list of lists) {
			for (const val of list) newList.add(val);
		}

		return newList;
	}

	public equals(list: List<V>): list is this {
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

	public static readonly default: typeof List = List;

}

export { List };
