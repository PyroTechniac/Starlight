const sameValueZero = (a, b): boolean => {
	if (a === 0 && b === 0) {
		return 1 / a === 1 / b;
	}

	if (a === b) {
		return true;
	}

	return isNaN(a) && isNaN(b);
};

/* eslint-disable @typescript-eslint/no-use-before-define */

export class StarlightIterator<V> implements IterableIterator<V> {

	public iterator: Iterator<V>;
	public peeked: boolean;
	public peekedAt: IteratorResult<V> | null;
	public constructor(iterator: Iterator<V>) {
		this.iterator = iterator;
		this.peeked = false;
		this.peekedAt = null;
	}

	public [Symbol.iterator](): IterableIterator<V> {
		return this;
	}

	public next(): IteratorResult<V, undefined> {
		if (this.peeked) {
			this.peeked = false;
			return this.peekedAt!;
		}

		return this.iterator.next();
	}

	public peek(): IteratorResult<V, undefined> {
		if (this.peeked) {
			return this.peekedAt!;
		}

		this.peeked = true;
		this.peekedAt = this.iterator.next();
		return this.peekedAt;
	}

	public at(index: number): V | undefined {
		let value: V | undefined;
		for (let i = 0; i <= index; i++) {
			const item = this.next();
			if (item.done) return undefined;

			value = item.value;
		}

		return value;
	}

	public count(): number {
		let i = 0;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const _ of this) i++;
		return i;
	}

	public last(): V {
		let val: V;
		for (const value of this) {
			val = value;
		}
		return val!;
	}

	public stepBy(stepSize: number): StepIterator<V> {
		return new StepIterator(this, stepSize);
	}

	public skip(skipAmount: number): SkipIterator<V> {
		return new SkipIterator(this, skipAmount);
	}

	public take(takeAmount: number): TakeIterator<V> {
		return new TakeIterator(this, takeAmount);
	}

	public skipWhile(fn: Predicate<V>): SkipWhileIterator<V> {
		return new SkipWhileIterator(this, fn);
	}

	public takeWhile(fn: Predicate<V>): TakeWhileIterator<V> {
		return new TakeWhileIterator(this, fn);
	}

	public concat(...iters: (Iterable<V> | Iterator<V>)[]): ConcatIterator<V> {
		return new ConcatIterator(this, iters.map((iter): StarlightIterator<V> => StarlightIterator.from(iter)));
	}

	public cycle(): CycleIterator<V> {
		return new CycleIterator(this);
	}

	public map(fn: Mapping<V>): MapIterator<V> {
		return new MapIterator(this, fn);
	}

	public filter(fn: Predicate<V>): FilterIterator<V> {
		return new FilterIterator(this, fn);
	}

	public each(fn: Consumer<V>): EachIterator<V> {
		return new EachIterator(this, fn);
	}

	public forEach(fn: Consumer<V>): void {
		for (const value of this) {
			fn(value);
		}
	}

	public reduce<T>(fn: Reducer<T, V>, accum?: T): T {
		if (typeof accum === 'undefined') {
			const first = this.next();
			if (first.done) {
				throw new TypeError('Reduce of empty sequence with no initial value');
			}

			accum = first.value as unknown as T;
		}

		for (const value of this) {
			accum = fn(accum, value);
		}

		return accum;
	}

	public and(): boolean {
		return this.reduce<boolean>((a, b): boolean => Boolean(a && b), true);
	}

	public or(): boolean {
		return this.reduce<boolean>((a, b): boolean => Boolean(a || b), false);
	}

	public find(fn: Predicate<V>): V | undefined {
		for (const value of this) {
			if (fn(value)) return value;
		}

		return undefined;
	}

	public findIndex(fn: Predicate<V>): number {
		let i = 0;
		for (const value of this) {
			if (fn(value)) return i;
			i++;
		}

		return -1;
	}

	public includes(searchElement: V, from = 0): boolean {
		let i = 0;
		for (const value of this) {
			if (i < from) {
				i++;
				continue;
			}

			if (sameValueZero(searchElement, value)) return true;
		}

		return false;
	}

	public every(fn: Predicate<V>): boolean {
		for (const value of this) {
			if (!fn(value)) return false;
		}

		return true;
	}

	public some(fn: Predicate<V>): boolean {
		for (const value of this) {
			if (fn(value)) return true;
		}

		return false;
	}

	public max(fn: Mapping<V> = (x): V => x): V | undefined {
		let max;
		const first = this.next();
		if (first.done) {
			return undefined;
		}

		max = first.value;
		for (const value of this) {
			if (fn(value) > fn(max)) {
				max = value;
			}
		}

		return max;
	}

	public min(fn: Mapping<V> = (x): V => x): V | undefined {
		let min;

		const first = this.next();
		if (first.done) return undefined;

		min = first.value;
		for (const value of this) {
			if (fn(value) < fn(min)) {
				min = value;
			}
		}

		return min;
	}

	public maxBy(fn: Comparator<V>): V | undefined {
		let max: V;
		const first = this.next();
		if (first.done) return undefined;

		max = first.value;
		for (const value of this) {
			if (fn(value, max) > 0) max = value;
		}

		return max;
	}

	public minBy(fn: Comparator<V>): V |undefined {
		let min: V;
		const first = this.next();
		if (first.done) {
			return undefined;
		}

		min = first.value;
		for (const value of this) {
			if (fn(value, min) < 0) {
				min = value;
			}
		}

		return min;
	}

	public collect(): V[] {
		const items: V[] = [];
		for (const value of this) {
			items.push(value);
		}

		return items;
	}

	public clone(): StarlightIterator<V> {
		const cache = this.collect();
		this.iterator = cache[Symbol.iterator]();
		return new StarlightIterator(cache[Symbol.iterator]());
	}

	public cloneMany(amount: number): StarlightIterator<V>[] {
		const cache = this.collect();
		this.iterator = cache[Symbol.iterator]();
		return Array.from({ length: amount }, (): StarlightIterator<V> => new StarlightIterator(cache[Symbol.iterator]()));
	}

	public static isIterator<V>(val: any): val is Iterator<V> {
		return typeof val.next === 'function';
	}

	public static isIterable<V>(val: any): val is Iterable<V> {
		return val != null && val[Symbol.iterator] != null; // eslint-disable-line eqeqeq, no-eq-null
	}

	public static from<V>(iter: Iterator<V> | Iterable<V>): StarlightIterator<V> {
		if (StarlightIterator.isIterator(iter)) {
			return new StarlightIterator(iter);
		}

		if (StarlightIterator.isIterable(iter)) {
			return new StarlightIterator(iter[Symbol.iterator]());
		}

		throw new TypeError('Value given is not iterable or an iterator');
	}

	public static for<V>(iter: Iterable<V> | Iterator<V>): StarlightIterator<V> {
		return StarlightIterator.from(iter);
	}

	public static of<V>(...items: V[]): StarlightIterator<V> {
		return new StarlightIterator(items[Symbol.species]());
	}

	public static range(start = 0, end = Infinity, step = 1, inclusive = false): StarlightIterator<number> {
		if (inclusive) {
			function *rangeInclusive(): Generator<number> {
				for (let i = start; i <= end; i += step) {
					yield i;
				}
			}
			return new StarlightIterator(rangeInclusive());
		}

		function *range(): Generator<number> {
			for (let i = start; i < end; i += step) {
				yield i;
			}
		}

		return new StarlightIterator(range());
	}

	public static repeat<V>(item: V, amount = Infinity): StarlightIterator<V> {

		function *repeat(): Generator<V> {
			for (let i = 0; i < amount; i++) {
				yield item;
			}
		}

		return new StarlightIterator(repeat());
	}


	public static repeatWith<V>(fn: Generating<V>, amount = Infinity): StarlightIterator<V> {
		function *repeatWith(): Generator<V> {
			for (let i = 0; i < amount; i++) {
				yield fn();
			}
		}

		return new StarlightIterator(repeatWith());
	}

	public static iterate<V>(fn: Mapping<V>, init: V): StarlightIterator<V> {
		function *iterate(): Generator<V> {
			let val = init;
			while (true) {
				yield val;
				val = fn(val);
			}
		}

		return new StarlightIterator(iterate());
	}

}

class StepIterator<V> extends StarlightIterator<V> {

	public stepSize: number;
	public constructor(iterator: Iterator<V>, stepSize: number) {
		super(iterator);
		this.stepSize = stepSize;
	}

	public next(): IteratorResult<V, undefined> {
		const item = this.iterator.next();
		for (let i = 0; i < this.stepSize - 1; i++) {
			this.iterator.next();
		}

		return item;
	}

}

class SkipIterator<V> extends StarlightIterator<V> {

	public skipAmount: number;
	public constructor(iterator: Iterator<V>, skipAmount: number) {
		super(iterator);
		this.skipAmount = skipAmount;
	}

	public next(): IteratorResult<V> {
		if (this.skipAmount !== 0) {
			this.skipAmount--;
			this.iterator.next();
			return this.next();
		}

		return this.iterator.next();
	}

}

class TakeIterator<V> extends StarlightIterator<V> {

	public takeAmount: number;
	public constructor(iterator: Iterator<V>, takeAmount: number) {
		super(iterator);
		this.takeAmount = takeAmount;
	}

	public next(): IteratorResult<V> {
		if (this.takeAmount !== 0) {
			this.takeAmount--;
			return this.iterator.next();
		}

		return { done: true, value: undefined as never };
	}

}

class SkipWhileIterator<V> extends StarlightIterator<V> {

	public fn: Predicate<V>;
	public finishedSkipping: boolean;
	public constructor(iterator: Iterator<V>, fn: Predicate<V>) {
		super(iterator);
		this.fn = fn;
		this.finishedSkipping = false;
	}

	public next(): IteratorResult<V> {
		if (!this.finishedSkipping) {
			const item = this.iterator.next();
			if (item.done) {
				return { done: true, value: undefined as never };
			}

			if (!this.fn(item.value)) {
				this.finishedSkipping = true;
				return { done: false, value: item.value };
			}

			return this.next();
		}

		return this.iterator.next();
	}

}

class TakeWhileIterator<V> extends StarlightIterator<V> {

	public fn: Predicate<V>;
	public finishedTaking: boolean;
	public constructor(iterator: Iterator<V>, fn: Predicate<V>) {
		super(iterator);
		this.fn = fn;
		this.finishedTaking = false;
	}

	public next(): IteratorResult<V> {
		if (!this.finishedTaking) {
			const item = this.iterator.next();
			if (item.done) {
				return { done: true, value: undefined as never };
			}

			if (!this.fn(item.value)) {
				this.finishedTaking = true;
				return { done: true, value: undefined as never };
			}

			return { done: false, value: item.value };
		}

		return { done: true, value: undefined as never };
	}

}

class ConcatIterator<V> extends StarlightIterator<V> {

	public concatIterators: StarlightIterator<V>[];
	public currentIterator: Iterator<V>;
	public constructor(iterator: Iterator<V>, concatIterators: StarlightIterator<V>[]) {
		super(iterator);
		this.concatIterators = concatIterators;
		this.currentIterator = this.iterator;
	}

	public next(): IteratorResult<V> {
		const item = this.currentIterator.next();
		if (item.done) {
			if (!this.concatIterators.length) {
				return { done: true, value: undefined as never };
			}

			this.currentIterator = this.concatIterators.shift()!;
			return this.next();
		}

		return item;
	}

}

class CycleIterator<V> extends StarlightIterator<V> {

	public cache: V[];
	public cachedAll: boolean;
	public constructor(iterator: Iterator<V>) {
		super(iterator);
		this.cache = [];
		this.cachedAll = false;
	}

	public next(): IteratorResult<V> {
		const item = this.iterator.next();
		if (item.done) {
			this.iterator = new StarlightIterator(this.cache[Symbol.iterator]());
			this.cachedAll = true;
			return this.next();
		}

		if (!this.cachedAll) {
			this.cache.push(item.value);
		}

		return item;
	}

}

class MapIterator<V> extends StarlightIterator<V> {

	public fn: Mapping<V>;

	public constructor(iterator: Iterator<V>, fn: Mapping<V>) {
		super(iterator);
		this.fn = fn;
	}

	public next(): IteratorResult<V> {
		const item = this.iterator.next();
		return item.done
			? { done: true, value: undefined as never }
			: { done: false, value: this.fn(item.value) };
	}

}

class FilterIterator<V> extends StarlightIterator<V> {

	public fn: Predicate<V>;
	public constructor(iterator: Iterator<V>, fn: Predicate<V>) {
		super(iterator);
		this.fn = fn;
	}

	public next(): IteratorResult<V> {
		const item = this.iterator.next();

		return item.done
			? { done: true, value: undefined as never }
			: this.fn(item.value)
				? { done: false, value: item.value }
				: this.next();
	}

}

class EachIterator<V> extends StarlightIterator<V> {

	public fn: Consumer<V>;
	public constructor(iterator: Iterator<V>, fn: Consumer<V>) {
		super(iterator);
		this.fn = fn;
	}

	public next(): IteratorResult<V> {
		const item = this.iterator.next();
		if (!item.done) {
			this.fn(item.value);
		}

		return item;
	}

}

interface Generating<V> {
	(): V;
}

interface Mapping<V> {
	(value: V): V;
}

interface Comparator<V> {
	(a: V, b: V): number;
}

interface Predicate<V> {
	(value: V): boolean;
}

interface Reducer<T, V> {
	(accum: T, item: V): T;
}

interface Consumer<V> {
	(param: V): void;
}
