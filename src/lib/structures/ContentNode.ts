import { Client, MessageEmbed } from 'discord.js';
import { ContentDeliveryNetwork } from './ContentDeliveryNetwork';
import { RequestInit } from 'node-fetch';
import { fetch } from '../util/Utils';

type FetchType = 'result' | 'json' | 'buffer' | 'text';

export class ContentNode {

	public readonly client!: Client;

	public url: string;

	public embed: MessageEmbed | null;

	public fetchType: FetchType;

	public createdTimestamp: number;

	private _data: unknown | null;

	private cb: (data: unknown) => unknown

	public constructor(client: Client, url: string, type: FetchType = 'json') {
		Object.defineProperty(this, 'client', { value: client });

		this._data = null;
		this.url = url;

		this.fetchType = type;

		this.createdTimestamp = Date.now();

		this.embed = null;

		this.cb = (data): unknown => data;
	}

	public get store(): ContentDeliveryNetwork {
		return this.client.cdn;
	}

	public get createdAt(): Date {
		return new Date(this.createdTimestamp);
	}

	public setup(callback: (data: unknown) => unknown): this {
		this.cb = callback;
		return this;
	}

	public data<V>(): V | null {
		return this._data ? this._data as V : null;
	}

	public delete(): boolean {
		return this.store.delete(this.url);
	}

	public fetch(options: RequestInit = {}, force = this._data === null): Promise<ContentNode> {
		const syncStatus = this.store.fetchMap.get(this);
		if (!force || syncStatus) return syncStatus || Promise.resolve(this);

		const sync = fetch(this.url, options, this.fetchType).then((data): this => {
			this._data = this.cb(data);

			this.store.fetchMap.delete(this);
			return this;
		});

		this.store.fetchMap.set(this, sync);
		return sync;
	}

}
