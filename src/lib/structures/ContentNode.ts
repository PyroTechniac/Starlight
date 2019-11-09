import { Client } from 'discord.js';
import { RequestInit } from 'node-fetch';
import { fetch } from '../util/Utils';
import { ContentDeliveryNetwork } from './ContentDeliveryNetwork';
import { Time } from '../types/Enums';
import { URL } from 'url';

type FetchType = 'result' | 'json' | 'buffer' | 'text';

const kTimeout = Symbol('ContentNodeTimeout');
const kValid = Symbol('ContentNodeValidity');

export class ContentNode {

	public readonly client!: Client;

	public url: string;

	public fetchType: FetchType;

	public createdTimestamp: number;

	private _data: unknown | null;

	private _cb: (data: unknown) => unknown;

	private _options: RequestInit;

	private [kTimeout]: number;

	private [kValid]: boolean;

	public constructor(client: Client, url: string) {
		Object.defineProperty(this, 'client', { value: client });
		this._data = null;
		this.url = url;
		this.fetchType = 'json';
		this.createdTimestamp = new Date().getTime();
		this._cb = (data): unknown => data;
		this._options = {};

		this._validate();
	}

	public get store(): ContentDeliveryNetwork {
		return this.client.cdn;
	}

	public get createdAt(): Date {
		return new Date(this.createdTimestamp);
	}

	public get fetching(): boolean {
		return this.store.fetchMap.has(this);
	}

	public get cacheExpired(): boolean {
		return Date.now() > this[kTimeout];
	}

	public get cacheRemaining(): number {
		return Math.max(Date.now() - this[kTimeout], 0);
	}

	public setCallback(callback: (data: any) => unknown): this {
		this.refresh();
		this._cb = callback;
		return this;
	}

	public setOptions(options: RequestInit = {}): this {
		this.refresh();
		this._options = options;
		return this;
	}

	public setType(type: FetchType): this {
		this.refresh();
		this.fetchType = type;
		return this;
	}

	public data<V>(): V | null {
		this.refresh();
		return this._data ? this._data as V : null;
	}

	public delete(): boolean {
		return this.store.delete(this.url);
	}

	public fetch(force = this._data === null): Promise<ContentNode> {
		this.refresh();
		if (!this[kValid]) throw new Error('Cannot fetch invalid Content Node.');
		const fetchStatus = this.store.fetchMap.get(this);
		if (!force || fetchStatus) return fetchStatus || Promise.resolve(this);

		const sync = fetch(this.url, this._options, this.fetchType)
			.then((data): this => {
				this._data = this._cb(data);
				return this;
			})
			.finally((): boolean => this.store.fetchMap.delete(this));


		this.store.fetchMap.set(this, sync);
		return sync;
	}

	public refresh(): this {
		this._validate();
		return this;
	}

	private _validate(): void {
		try {
			new URL(this.url);
			this[kValid] = true;
		} catch {
			this[kValid] = false;
		}

		this[kTimeout] = Date.now() + (Time.Minute * 3);
	}

}
