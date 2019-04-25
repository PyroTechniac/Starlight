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
}
