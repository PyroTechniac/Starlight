import { Client } from 'discord.js';
import { ContentFetchEngine, FetchApi } from './ContentFetchEngine';
import { ClientCacheEngine } from '../util/cache/ClientCacheEngine';


export class ClientEngine {

	public readonly client!: Client;

	public network: ContentFetchEngine = new ContentFetchEngine(this);

	public cache: ClientCacheEngine = new ClientCacheEngine(this);

	public constructor(client: Client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	public get cdn(): FetchApi {
		return this.network.cdn;
	}

}

