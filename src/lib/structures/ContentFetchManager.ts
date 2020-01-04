import { Manager } from '../util/Manager';
import { URL } from 'url';
import nodeFetch, { RequestInit, Response } from 'node-fetch';
import { FetchError } from '../util/FetchError';
import { Type } from 'klasa';
import AbortController from 'abort-controller';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {
};
const methods = ['get', 'post', 'patch', 'put', 'delete'];
const reflectors = [
	'toString', 'valueOf', 'inspect', 'constructor',
	Symbol.toPrimitive, Symbol.for('nodejs.util.inspect.custom')
];
const standards = ['url', 'options', 'type', ...methods];

const aborts = ['then', 'catch', 'finally'];


export const enum FetchTypes {
	JSON,
	Buffer,
	Text,
	Result
}

export class ContentFetchManager extends Manager {

	public get cdn(): FetchApi {
		return ContentFetchManager._cdn(this);
	}

	public fetch(url: URL | string, type: FetchTypes.JSON | 'JSON'): Promise<unknown>;

	public fetch(url: URL | string, options: RequestInit, type: FetchTypes.JSON | 'JSON'): Promise<unknown>;

	public fetch(url: URL | string, type: FetchTypes.Buffer | 'Buffer'): Promise<Buffer>;

	public fetch(url: URL | string, options: RequestInit, type: FetchTypes.Buffer | 'Buffer'): Promise<Buffer>;

	public fetch(url: URL | string, type: FetchTypes.Text | 'Text'): Promise<string>;

	public fetch(url: URL | string, options: RequestInit, type: FetchTypes.Text | 'Text'): Promise<string>;

	public fetch(url: URL | string, type: FetchTypes.Result | 'Result'): Promise<Response>;

	public fetch(url: URL | string, options: RequestInit, type: FetchTypes.Result | 'Result'): Promise<Response>;

	public fetch(url: URL | string, options: RequestInit, type: FetchTypes | keyof typeof FetchTypes): Promise<Response | Buffer | string | unknown>;

	public fetch(url: URL | string, options: RequestInit | FetchTypes | keyof typeof FetchTypes, type?: FetchTypes | keyof typeof FetchTypes): Promise<Response | string | unknown | Buffer> {
		if (typeof options === 'undefined') {
			options = {};
			type = FetchTypes.JSON;
		} else if (typeof options === 'number' || typeof options === 'string') {
			type = options;
			options = {};
		} else if (typeof type === 'undefined') {
			type = FetchTypes.JSON;
		}

		const stackHolder: { stack?: string } = {};

		Error.captureStackTrace(stackHolder, ContentFetchManager.prototype.fetch);

		return this._internalFetch(new URL(url.toString()), options, type, stackHolder.stack);
	}

	private async _internalFetch(url: URL, options: RequestInit, type: FetchTypes | keyof typeof FetchTypes, stack?: string): Promise<Buffer | string | unknown | Response> {
		const controller = new AbortController();
		const timeout = this.client.setTimeout((): void => controller.abort(), this.client.options.cdnRequestTimeout);
		const result: Response = await nodeFetch(url, options)
			.catch((err): never => {
				if (err instanceof Error) throw new FetchError(err.message, 400, url.toString(), stack);
				else throw err;
			})
			.finally((): void => this.client.clearTimeout(timeout));
		if (!result.ok) throw new FetchError(await result.text(), result.status, url.toString(), stack);

		switch (type) {
			case FetchTypes.Result:
			case 'Result':
				return result;
			case FetchTypes.Buffer:
			case 'Buffer':
				return result.buffer();
			case FetchTypes.JSON:
			case 'JSON':
				return result.json();
			case FetchTypes.Text:
			case 'Text':
				return result.text();
			default:
				throw new TypeError(`Unknown type '${type}'`);
		}
	}

	private static _cdn(manager: ContentFetchManager): FetchApi {
		const stackholder: { stack?: string } = {};
		Error.captureStackTrace(stackholder, ContentFetchManager._cdn); // eslint-disable-line @typescript-eslint/unbound-method
		const route: any[] = [];
		const handler: ProxyHandler<any> = {
			get(_, name: string | symbol): any {
				if (reflectors.includes(name)) return noop;
				ContentFetchManager.aString(name);

				if (aborts.includes(name)) return new Proxy(noop, handler);

				if (methods.includes(name)) {
					let url: URL;
					let options: RequestInit = { method: name.toUpperCase() };
					let type: FetchTypes = FetchTypes.JSON;

					for (const [i, r] of route.entries()) {
						if (/url/i.test(r)) {
							try {
								url = new URL(route[i + 1]);
							} catch {
								throw new Error('Invalid URL Provided');
							}
						}
						if (/options/i.test(r)) options = { ...options, ...route[i + 1] };
						if (/type/i.test(r)) type = route[i + 1];
					}
					return (): Promise<Response | Buffer | string | unknown> => manager._internalFetch(url!, options, type, stackholder.stack);
				}

				route.push(name);
				return new Proxy(noop, handler);
			},
			apply(_, __, args): any {
				route.push(...args.filter((x): boolean => x != null)); // eslint-disable-line no-eq-null
				return new Proxy(noop, handler);
			},
			has(_, name: string) {
				return (!aborts.includes(name) && standards.includes(name));
			}
		};
		return new Proxy(noop, handler);
	}

	private static aString(input: unknown): asserts input is string {
		if (typeof input !== 'string') throw new TypeError(`Expected a string input, got: ${new Type(input)}`);
	}

}

export interface ApiMethods {
	get<T = unknown>(): Promise<T>;

	post<T = unknown>(): Promise<T>;

	patch<T = unknown>(): Promise<T>;

	put<T = unknown>(): Promise<T>;

	delete<T = unknown>(): Promise<T>;
}

export interface FetchApi extends ApiMethods {
	url(url: string | URL): ApiURL;

	options(options: Omit<RequestInit, 'method'>): ApiOptions;

	type(type: FetchTypes | keyof typeof FetchTypes): ApiType;
}

export interface ApiURL extends Omit<FetchApi, 'url'> {
}

export interface ApiOptions extends Omit<FetchApi, 'options'> {
}

export interface ApiType extends Omit<FetchApi, 'type'> {
}
