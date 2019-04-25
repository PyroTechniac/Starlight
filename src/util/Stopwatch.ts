import { performance } from 'perf_hooks';

export class Stopwatch {
	public digits: number;
	private _start: number = performance.now();
	private _end: number | null = null;
	constructor(digits: number = 2) {
		this.digits = digits;
	}

	get duration(): number {
		return this._end ? this._end - this._start : performance.now() - this._start;
	}
}