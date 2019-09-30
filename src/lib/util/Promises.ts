// These are nice utilities for Promises
import { EventEmitter, once } from 'events';
import { util } from 'klasa';
import { StarlightTypeError } from './StarlightErrors';
import { Client } from 'discord.js';
import { Events } from '@typings/Enums';

const { isFunction } = util;

enum PromiseEvents {
	Resolve = 'resolve',
	Reject = 'reject',
	Finally = 'finally'
}


class PromiseUtil { // eslint-disable-line @typescript-eslint/no-extraneous-class

	public static createReferPromise<T>(): {
		promise: Promise<T>;
		resolve: (value?: T | undefined) => void;
		reject: (error?: Error | undefined) => void;
	} {
		let resolve: (value?: T) => void;
		let reject: (error?: Error) => void;

		const promise: Promise<T> = new Promise((res, rej): void => {
			resolve = res;
			reject = rej;
		});

		return { promise, resolve: resolve!, reject: reject! };
	}

	public static floatPromise<V = unknown>(ctx: { client: Client }, promise: Promise<V>): void {
		if (PromiseUtil.isThenable<V>(promise)) promise.catch((error): boolean => ctx.client.emit(Events.Wtf, error));
	}

	public static isThenable<V = unknown>(input: unknown): input is Promise<V> {
		if (!input) return false;
		return (input instanceof Promise)
			|| (input !== Promise.prototype && PromiseUtil.hasThen(input as { then?: Function }) && PromiseUtil.hasCatch(input as { catch?: Function }));
	}

	public static async *iterate<V>(...promises: Promise<V>[]): AsyncGenerator<V, void> {
		for (const prom of promises) {
			yield await prom;
		}
	}

	private static hasThen(input: { then?: Function }): boolean {
		return isFunction(input.then);
	}

	private static hasCatch(input: { catch?: Function }): boolean {
		return isFunction(input.catch);
	}

}

class PromiseEmitter<V> extends EventEmitter {

	public promise: Promise<V>;
	public constructor(promise: Promise<V>) {
		super();
		if (!PromiseUtil.isThenable(promise)) throw new StarlightTypeError('EXPECTED_FOUND').init('Promise', promise);
		this.promise = promise;

		this.init();
	}

	public waitFor(event: PromiseEvents | 'error'): Promise<any[]> {
		return once(this, event);
	}

	private init(): void {
		this.promise
			.then((value): void => {
				this.emit(PromiseEvents.Resolve, value);
			})
			.catch((err): void => {
				this.emit(PromiseEvents.Reject, err);
			})
			.finally((): void => {
				this.emit(PromiseEvents.Finally);
			});
	}

}

export {
	PromiseEmitter,
	PromiseUtil,
	PromiseEvents
};
