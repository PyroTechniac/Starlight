import { RequestInit } from 'node-fetch';
import { FetchType, fetch } from './Utils';
import { URL } from 'url';

const noop = (): void => { };
const methods = ['get', 'post', 'put', 'patch', 'delete'];

interface ApiMethods {
	get<T extends unknown = unknown>(): Promise<T>;
	post<T extends unknown = unknown>(): Promise<T>;
	patch<T extends unknown = unknown>(): Promise<T>;
	put<T extends unknown = unknown>(): Promise<T>;
	delete<T extends unknown = unknown>(): Promise<T>;
}

interface Fetch extends ApiMethods {
	url(url: string): ApiURL;
	options(options: Omit<RequestInit, 'method'>): ApiOptions;
	type(type: FetchType): ApiType;
}

interface ApiURL extends Omit<Fetch, 'url'> { }

interface ApiOptions extends Omit<Fetch, 'options'> { }

interface ApiType extends Omit<Fetch, 'type'> { }

export function cdn(): Fetch {
	const route: any[] = [];
	const handler: ProxyHandler<any> = {
		get(_, name: string) {
			if (methods.includes(name)) {
				let url: URL;
				let options: RequestInit = { method: name.toUpperCase() };
				let type: FetchType = FetchType.JSON;
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

				return (): Promise<any> => fetch(url, options, type);
			}

			route.push(name);
			return new Proxy(noop, handler);
		},
		apply(_, __, args) {
			route.push(...args.filter((x): boolean => x != null)); // eslint-disable-line no-eq-null
			return new Proxy(noop, handler);
		}
	};

	return new Proxy(noop, handler);
}
