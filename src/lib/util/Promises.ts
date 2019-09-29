// These are nice utilities for Promises
import { EventEmitter, once } from 'events';

enum PromiseEvents {
	Resolve = 'resolve',
	Reject = 'reject',
	Finally = 'finally'
}

class PromiseEmitter<V> extends EventEmitter {

	public promise: Promise<V>;
	public constructor(promise: Promise<V>) {
		super();
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

}

export {
	PromiseEmitter,
	PromiseUtil,
	PromiseEvents
};
