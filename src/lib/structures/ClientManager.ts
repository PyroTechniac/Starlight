import { Client } from 'discord.js';
import { ContentFetchManager, FetchApi } from './ContentFetchManager';
import { ClientCacheManager } from '../util/cache/ClientCacheManager';
import { ResourceManager } from './ResourceManager';


export class ClientManager {

	public readonly client!: Client;

	public network: ContentFetchManager = new ContentFetchManager(this);

	public downloads: ResourceManager = new ResourceManager(this);

	public cache: ClientCacheManager = new ClientCacheManager(this);

	public constructor(client: Client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	public get cdn(): FetchApi {
		return this.network.cdn;
	}

}

