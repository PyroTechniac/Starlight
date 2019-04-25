import { performance } from 'perf_hooks';

export class Stopwatch {
    public digits: number;
    private _start: number = performance.now();
    private _end: number | null = null;
    public constructor(digits: number = 2) {
        this.digits = digits;
    }

    public get duration(): number {
        return this._end ? this._end - this._start : performance.now() - this._start;
    }

    public get running(): boolean {
        return Boolean(!this._end);
    }

    public restart(): Stopwatch {
        this._start = performance.now();
        this._end = null;
        return this;
    }

    public reset(): Stopwatch {
        this._start = performance.now();
        this._end = this._start;
        return this;
    }

    public start(): Stopwatch {
        if (!this.running) {
            this._start = performance.now() - this.duration;
            this._end = null;
        }
        return this;
    }

    public stop(): Stopwatch {
        if (this.running) this._end = performance.now();
        return this;
    }

    public toString(): string {
        const time = this.duration;
        if (time >= 1000) return `${(time / 1000).toFixed(this.digits)}s`;
        if (time >= 1) return `${time.toFixed(this.digits)}ms`;
        return `${(time * 1000).toFixed(this.digits)}μs`;
    }
}
