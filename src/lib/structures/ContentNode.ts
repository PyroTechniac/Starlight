import { Client, MessageEmbed } from 'discord.js';
import { ContentDeliveryNetwork } from './ContentDeliveryNetwork';
import { RequestInit } from 'node-fetch';
import { fetch } from '../util/Utils';

type FetchType = 'result' | 'json' | 'buffer' | 'text';

type EmbedTemplate = (data: unknown) => MessageEmbed;

export class ContentNode {

	public readonly client!: Client;

	public url: string;

	public fetchType: FetchType;

	public createdTimestamp: number;

	private _data: unknown | null;

	private _embed: EmbedTemplate;

	private cb: (data: unknown) => unknown;

	public constructor(client: Client, url: string, type: FetchType = 'json') {
		Object.defineProperty(this, 'client', { value: client });
		this._data = null;
		this.url = url;
		this.fetchType = type;
		this.createdTimestamp = Date.now();
		this._embed = (): MessageEmbed => new MessageEmbed();
		this.cb = (data): unknown => data;
	}

	public get store(): ContentDeliveryNetwork {
		return this.client.cdn;
	}

	public get createdAt(): Date {
		return new Date(this.createdTimestamp);
	}

	public get embed(): MessageEmbed {
		return this._data ? this._embed(this.data()) : new MessageEmbed();
	}

	public get fetching(): boolean {
		return this.store.fetchMap.has(this);
	}

	public setCallback(callback: (data: unknown) => unknown): this {
		this.cb = callback;
		return this;
	}

	public setTemplate(cb: EmbedTemplate): this {
		this._embed = cb;
		return this;
	}

	public data<V>(): V | null {
		return this._data ? this._data as V : null;
	}

	public delete(): boolean {
		return this.store.delete(this.url);
	}

	public fetch(options: RequestInit = {}, force = this._data === null): Promise<ContentNode> {
		const fetchStatus = this.store.fetchMap.get(this);
		if (!force || fetchStatus) return fetchStatus || Promise.resolve(this);

		const sync = fetch(this.url, options, this.fetchType).then((data): this => {
			this._data = this.cb(data);

			this.store.fetchMap.delete(this);
			return this;
		});

		this.store.fetchMap.set(this, sync);
		return sync;
	}

}
