import { Client, MessageEmbed } from 'discord.js';
import { ContentDeliveryNetwork } from './ContentDeliveryNetwork';
import { RequestInit } from 'node-fetch';
import { fetch } from '../util/Utils';
import { ContentNodeDefaults } from '../types/Interfaces';

type FetchType = 'result' | 'json' | 'buffer' | 'text';

type EmbedTemplate = (data: unknown) => MessageEmbed;

export class ContentNode {

	public readonly client!: Client;

	public url: string;

	public fetchType: FetchType;

	public createdTimestamp: number;

	public defaults: ContentNodeDefaults;

	private _data: unknown | null;

	private _embed: EmbedTemplate;

	private _cb: (data: unknown) => unknown;

	private _options: RequestInit;

	public constructor(client: Client, url: string) {
		Object.defineProperty(this, 'client', { value: client });
		this._data = null;
		this.url = url;
		this.fetchType = 'json';
		this.defaults = {
			callback: true,
			template: true,
			options: true,
			fetchType: true
		};
		this.createdTimestamp = Date.now();
		this._embed = (): MessageEmbed => new MessageEmbed();
		this._cb = (data): unknown => data;
		this._options = {};
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
		this._cb = callback;
		this.defaults.callback = false;
		return this;
	}

	public setTemplate(cb: EmbedTemplate): this {
		this._embed = cb;
		this.defaults.template = false;
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

		const sync = fetch(this.url, this._options, this.fetchType).then((data): this => {
			this._data = this._cb(data);

			this.store.fetchMap.delete(this);
			return this;
		});

		this.store.fetchMap.set(this, sync);
		return sync;
	}

}
