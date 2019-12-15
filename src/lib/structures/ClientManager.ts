import { Client } from 'discord.js';
import { ContentFetchManager, FetchApi } from './ContentFetchManager';
import { ClientCache } from '../util/cache/ClientCache';


export class ClientManager {

	public readonly client!: Client;

	public network: ContentFetchManager = new ContentFetchManager(this);

	public cache: ClientCache = new ClientCache(this);

	public constructor(client: Client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	public get cdn(): FetchApi {
		return this.network.cdn;
	}

}

