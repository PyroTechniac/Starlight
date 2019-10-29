import { ReferredPromise } from '../types/Interfaces';
import { KlasaClient } from 'klasa';
import { createReferPromise, floatPromise } from './Utils';

export class Locker {

	public readonly client!: KlasaClient;
	private readonly _locks: ReferredPromise<undefined>[] = [];

	public constructor(client: KlasaClient) {
		Object.defineProperty(this, 'client', { value: client });
	}

	public get locks(): Set<ReferredPromise<undefined>> {
		return new Set([...this._locks]);
	}

	public createLock(): (value?: undefined) => void {
		const lock = createReferPromise<undefined>();
		this._locks.push(lock);
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		floatPromise(this, lock.promise.finally((): void => {
			this._locks.splice(this._locks.indexOf(lock), 1);
		}));
		// eslint-disable-next-line @typescript-eslint/unbound-method
		return lock.resolve;
	}

	public releaseLock(): void {
		for (const lock of this._locks) lock.resolve();
	}

	public waitLock(): Promise<undefined[]> {
		return Promise.all(this._locks.map((lock): Promise<undefined> => lock.promise));
	}

}
