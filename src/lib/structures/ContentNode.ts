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
	public constructor(client: Client, url: string, type: FetchType = 'json') {
		Object.defineProperty(this, 'client', { value: client });

		this._data = null;
		this.url = url;

		this.fetchType = type;

		this.createdTimestamp = Date.now();

		this.embed = null;
	}

	public get store(): ContentDeliveryNetwork {
		return this.client.cdn;
	}

	public get createdAt(): Date {
		return new Date(this.createdTimestamp);
	}

	public data<V>(): V | null {
		return this._data ? this._data as V : null;
	}

	public delete(): boolean {
		return this.store.delete(this.url);
	}

	public async fetch(options: RequestInit): Promise<this> {
		const data = await fetch(this.url, options, this.fetchType);

		this._data = data;
		return this;
	}

}
