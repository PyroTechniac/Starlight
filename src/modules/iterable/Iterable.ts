export class Iterable<V> {
    public peeked: boolean = false;
    public peekedAt: IteratorResult<V> = null;
    public constructor(protected iterator: Iterator<V>) { }
    public [Symbol.iterator]() {
        return this;
    }

    public next(): IteratorResult<V> {
        if (this.peeked) {
            this.peeked = false;
            return this.peekedAt;
        }
        return this.iterator.next();
    }

    public peek(): IteratorResult<V> {
        if (this.peeked) {
            return this.peekedAt;
        }
        this.peeked = true;
        this.peekedAt = this.iterator.next();
        return this.peekedAt;
    }

    public at(index: number): V | undefined {
        let value: V;
        for (let i = 0; i <= index; i++) {
            const item = this.next();
            if (item.done) {
                return undefined;
            }
            value = item.value;
        }
        return value;
    }

    public count(): number {
        let i = 0;

        for (const { } of this) {
            i++;
        }
        return i;
    }

    public last(): V {
        let val: V;
        for (const value of this) {
            val = value;
        }
        return val;
    }

    public stepBy(stepSize: number): StepIterable<V> {
        return new StepIterable(this, stepSize);
    }

    public skip(skipAmount: number): SkipIterable<V> {
        return new SkipIterable(this, skipAmount);
    }

    public take(takeAmount: number): TakeIterable<V> {
        return new TakeIterable(this, takeAmount);
    }
}

class TakeIterable<V> extends Iterable<V> {
    private takeAmount: number;
    public constructor(iterator: Iterable<V>, takeAmount: number) {
        super(iterator);
        this.takeAmount = takeAmount;
    }

    public next(): IteratorResult<V> {
        if (this.takeAmount !== 0) {
            this.takeAmount--;
            return this.iterator.next();
        }

        return { done: true } as IteratorResult<V>;
    }
}

class StepIterable<V> extends Iterable<V> {
    private stepSize: number;
    public constructor(iterator: Iterable<V>, stepSize: number) {
        super(iterator);
        this.stepSize = stepSize;
    }

    public next(): IteratorResult<V> {
        const item = this.iterator.next();
        for (let i = 0; i < this.stepSize - 1; i++) {
            this.iterator.next();
        }
        return item;
    }
}

class SkipIterable<V> extends Iterable<V> {
    private skipAmount: number;
    public constructor(iterator: Iterable<V>, skipAmount: number) {
        super(iterator);
        this.skipAmount = skipAmount;
    }

    public next() {
        if (this.skipAmount !== 0) {
            this.skipAmount--;
            this.iterator.next();
            return this.next();
        }

        return this.iterator.next();
    }
}