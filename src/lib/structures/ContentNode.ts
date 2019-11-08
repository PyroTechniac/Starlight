import { Client } from 'discord.js';
import { RequestInit } from 'node-fetch';
import { ContentNodeDefaults } from '../types/Interfaces';
import { fetch } from '../util/Utils';
import { ContentDeliveryNetwork } from './ContentDeliveryNetwork';
import {Time} from "../types/Enums";

type FetchType = 'result' | 'json' | 'buffer' | 'text';

const kTimeout = Symbol('ContentNodeTimeout');

export class ContentNode {

	public readonly client!: Client;

	public url: string;

	public fetchType: FetchType;

	public createdTimestamp: number;

	public defaults: ContentNodeDefaults;

	private _data: unknown | null;

	private _cb: (data: unknown) => unknown;

	private _options: RequestInit;

	private [kTimeout] = Date.now() + (Time.Minute * 15);

	public constructor(client: Client, url: string) {
		Object.defineProperty(this, 'client', { value: client });
		this._data = null;
		this.url = url;
		this.fetchType = 'json';
		this.defaults = {
			callback: true,
			options: true,
			fetchType: true
		};
		this.createdTimestamp = new Date().getTime();
		this._cb = (data): unknown => data;
		this._options = {};
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
		this._cb = callback;
		this.defaults.callback = false;
		return this;
	}

	public setOptions(options: RequestInit = {}): this {
		this._options = options;
		this.defaults.options = false;
		return this;
	}

	public setType(type: FetchType): this {
		this.fetchType = type;
		this.defaults.fetchType = false;
		return this;
	}

	public data<V>(): V | null {
		return this._data ? this._data as V : null;
	}

	public delete(): boolean {
		return this.store.delete(this.url);
	}

	public fetch(force = this._data === null): Promise<ContentNode> {
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

}
