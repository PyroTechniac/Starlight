import { Client } from 'discord.js';
import { ContentFetchManager } from './ContentFetchManager';
import { ClientCache } from '../util/cache/ClientCache';
import { Fetch } from '../util/Cdn';

export class ClientManager {

	public readonly client!: Client;

	public network: ContentFetchManager = new ContentFetchManager(this);

	public cache: ClientCache = new ClientCache(this);

	public constructor(client: Client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	public get cdn(): Fetch {
		return this.network.cdn;
	}

}

