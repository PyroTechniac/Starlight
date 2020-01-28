import { Client } from 'discord.js';
import { ContentFetchEngine, FetchApi } from './ContentFetchEngine';
import { SchemaEngine } from './SchemaEngine';


export class ClientEngine {

	public readonly client!: Client;

	public network: ContentFetchEngine = new ContentFetchEngine(this);

	public schemas: SchemaEngine = new SchemaEngine(this);

	public constructor(client: Client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	public get cdn(): FetchApi {
		return this.network.cdn;
	}

}

