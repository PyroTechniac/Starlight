import { Client } from 'discord.js';
import { createReferPromise, floatPromise } from '../util/Utils';
import { Lock, LockMetadata, ReferredPromise } from '../types/Interfaces';
import { enumerable } from '../util/Decorators';
import { ContentFetchManager } from './ContentFetchManager';
import { ClientCache } from '../util/cache/ClientCache';
import { Fetch } from '../util/Cdn';
import { deepClone, mergeDefault, toTitleCase } from '@klasa/utils';

// TODO: Make this have special metadata and reject if something is taking too long.

const enum ClientManagerEvents {
	Busy = 'busy',
	Free = 'free'
}

export class ClientManager {

	public readonly client!: Client;

	public network: ContentFetchManager = new ContentFetchManager(this);

	public cache: ClientCache = new ClientCache(this);

	public globalMetadata: LockMetadata = {
		caller: 'global',
		unique: this.createMetadataSymbol('global'),
		timeout: 10000
	};

	@enumerable(false)
	private readonly _locks: Map<symbol, Lock> = new Map<symbol, Lock>();

	private _interval: NodeJS.Timer | null = null;

	private _baseTimeout: number | null = null;

	public constructor(client: Client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	public get busy(): boolean {
		return Boolean(this._locks.size);
	}

	public get cdn(): Fetch {
		return this.network.cdn;
	}

	public createLock(data: LockMetadata): (value?: undefined) => void {
		this.client.emit(ClientManagerEvents.Busy);
		const metadata = this.createMetadata(data);
		this._locks.set(metadata.unique, metadata);
		floatPromise(this, metadata.referred.promise) // eslint-disable-line @typescript-eslint/no-floating-promises
			.finally((): void => {
				this._locks.delete(metadata.unique);
			});

		this._checkInterval();

		return metadata.referred.resolve; // eslint-disable-line @typescript-eslint/unbound-method
	}

	public createMetadataSymbol(caller: string): symbol {
		if (caller === 'global') caller += ClientManager._generateID(this.client);
		return Symbol(`ClientLock${toTitleCase(caller)}`);
	}

	public releaseLocks(): void {
		const amount = this._locks.size;
		for (const lock of this.locks()) lock.resolve();
		this.client.emit(ClientManagerEvents.Free, amount);
	}

	public async waitLocks(): Promise<void> {
		const amount = (await Promise.all(this)).length;
		this.client.emit(ClientManagerEvents.Free, amount);
	}

	public *locks(): IterableIterator<ReferredPromise<undefined>> {
		yield *[...this._locks.values()].map((data): ReferredPromise<undefined> => data.referred);
	}

	public *[Symbol.iterator](): IterableIterator<Promise<undefined>> {
		yield *[...this._locks.values()].map((data): Promise<undefined> => data.referred.promise);
	}

	private createMetadata(data: LockMetadata): Lock {
		return mergeDefault<LockMetadata, Lock>(this.globalMetadata, { referred: createReferPromise<undefined>(), ...deepClone(data) });
	}

	private _sweepLocks(): void {
		const now = Date.now() - this._baseTimeout!;
		for (const promise of this._locks.values()) {
			if (promise.timeout > now) promise.referred.reject(new Error(`${promise.caller} timed out.`));
		}

		this._baseTimeout = Date.now();
		this._checkInterval();
	}

	private _checkInterval(): void {
		if (!this._locks.size) {
			this._clearInterval();
		} else if (!this._interval) {
			this._interval = this.client.setInterval(this._sweepLocks.bind(this), 15000);
			this._baseTimeout = Date.now();
		}
	}

	private _clearInterval(): void {
		this.client.clearInterval(this._interval!);
		this._interval = null;
		this._baseTimeout = null;
	}

	private static _generateID(client: Client): string {
		return `${Date.now().toString(36)}${client.options.shards[0]!.toString(36)}`;
	}

}

