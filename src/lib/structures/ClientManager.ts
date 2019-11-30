import { Client } from 'discord.js';
import { createReferPromise, floatPromise } from '../util/Utils';
import { ReferredPromise } from '../types/Interfaces';
import { enumerable } from '../util/Decorators';

const enum ClientManagerEvents {
	Busy = 'busy',
	Free = 'free'
}

export class ClientManager {

	public readonly client!: Client;

	@enumerable(false)
	private readonly _locks: Set<ReferredPromise<undefined>> = new Set<ReferredPromise<undefined>>();

	public constructor(client: Client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	public get busy(): boolean {
		return Boolean(this._locks.size);
	}

	public create(): (value?: undefined) => void {
		this.client.emit(ClientManagerEvents.Busy);
		const referred = createReferPromise<undefined>();
		this._locks.add(referred);
		floatPromise(this, referred.promise) // eslint-disable-line @typescript-eslint/no-floating-promises
			.finally((): void => {
				this._locks.delete(referred);
			});

		return referred.resolve; // eslint-disable-line @typescript-eslint/unbound-method
	}

	public release(): void {
		const amount = this._locks.size;
		for (const lock of this._locks) lock.resolve();
		this.client.emit(ClientManagerEvents.Free, amount);
	}

	public async wait(): Promise<void> {
		const amount = (await Promise.all(this)).length;
		this.client.emit(ClientManagerEvents.Free, amount);
	}

	public *[Symbol.iterator](): IterableIterator<Promise<undefined>> {
		yield *[...this._locks].map((ref): Promise<undefined> => ref.promise);
	}

}

