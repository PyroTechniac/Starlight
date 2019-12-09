import { cdn, Fetch } from '../util/Cdn';
import { ClientManager } from './ClientManager';
import { URL } from 'url';
import nodeFetch, { RequestInit, Response } from 'node-fetch';
import { FetchError } from '../util/FetchError';

export const enum FetchTypes {
	JSON,
	Buffer,
	Text,
	Result
}

export class ContentFetchManager {

	public readonly manager: ClientManager;

	public constructor(manager: ClientManager) {
		this.manager = manager;
	}

	public get cdn(): Fetch {
		return cdn(this);
	}

	public async fetch(url: URL | string, type: FetchTypes.JSON | 'JSON'): Promise<unknown>;
	public async fetch(url: URL | string, options: RequestInit, type: FetchTypes.JSON | 'JSON'): Promise<unknown>;
	public async fetch(url: URL | string, type: FetchTypes.Buffer | 'Buffer'): Promise<Buffer>;
	public async fetch(url: URL | string, options: RequestInit, type: FetchTypes.Buffer | 'Buffer'): Promise<Buffer>;
	public async fetch(url: URL | string, type: FetchTypes.Text | 'Text'): Promise<string>;
	public async fetch(url: URL | string, options: RequestInit, type: FetchTypes.Text | 'Text'): Promise<string>;
	public async fetch(url: URL | string, type: FetchTypes.Result | 'Result'): Promise<Response>;
	public async fetch(url: URL | string, options: RequestInit, type: FetchTypes.Result | 'Result'): Promise<Response>;
	public async fetch(url: URL | string, options: RequestInit, type: FetchTypes | keyof typeof FetchTypes): Promise<Response | Buffer | string | unknown>;
	public async fetch(url: URL | string, options: RequestInit | FetchTypes | keyof typeof FetchTypes, type?: FetchTypes | keyof typeof FetchTypes): Promise<Response | string | unknown | Buffer> {
		if (typeof options === 'undefined') {
			options = {};
			type = FetchTypes.JSON;
		} else if (typeof options === 'number' || typeof options === 'string') {
			type = options;
			options = {};
		} else if (typeof type === 'undefined') {
			type = FetchTypes.JSON;
		}

		const urlObj = new URL(url.toString());
		const result: Response = await nodeFetch(urlObj, options);
		if (!result.ok) throw new FetchError(await result.text(), result.status, urlObj.toString());

		switch (type) {
			case FetchTypes.Result:
			case 'Result': return result;
			case FetchTypes.Buffer:
			case 'Buffer': return result.buffer();
			case FetchTypes.JSON:
			case 'JSON': return result.json();
			case FetchTypes.Text:
			case 'Text': return result.text();
			default: throw new TypeError(`Unknown type '${type}'`);
		}
	}

}
