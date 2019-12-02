import { ApiMethods, cdn, Fetch } from '../util/Cdn';
import { ClientManager } from './ClientManager';
import { RequestInit } from 'node-fetch';
import { FetchType } from '../util/Utils';

// TODO: Mimic discord.js' Rest behavior with this.

export class ContentFetchManager {

	public readonly manager: ClientManager;

	public constructor(manager: ClientManager) {
		this.manager = manager;
	}

	public get cdn(): Fetch {
		return cdn();
	}

	public fetch<T = unknown>(url: string, options: RequestInit, type: FetchType): ApiMethods {
		return this.cdn.url(url).options(options).type(type);
	}

}
