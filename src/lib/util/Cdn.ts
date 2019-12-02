import { RequestInit } from 'node-fetch';
import { FetchType, fetch } from './Utils';
import { URL } from 'url';

const noop = (): void => { };
const methods = ['get', 'post', 'put', 'patch', 'delete'];
const reflectors = [
	'toString', 'valueOf', 'inspect', 'constructor',
	Symbol.toPrimitive, Symbol.for('nodejs.util.inspect.custom')
];
const standards = ['url', 'options', 'type'];

const aborts = ['then', 'catch'];

export interface Fetch extends ApiMethods {
	url(url: string): ApiURL;
	options(options: Omit<RequestInit, 'method'>): ApiOptions;
	type(type: FetchType): ApiType;
}

export interface ApiMethods {
	get<T = unknown>(): Promise<T>;
	post<T = unknown>(): Promise<T>;
	patch<T = unknown>(): Promise<T>;
	put<T = unknown>(): Promise<T>;
	delete<T = unknown>(): Promise<T>;
}

export interface ApiURL extends Omit<Fetch, 'url'> { }

export interface ApiOptions extends Omit<Fetch, 'options'> { }

export interface ApiType extends Omit<Fetch, 'type'> { }

export function cdn(): Fetch {
	const route: any[] = [];
	const handler: ProxyHandler<any> = {
		get(_, name: string | symbol) {
			if (reflectors.includes(name)) return noop;
			assertString(name);
			// This is commented out until klasa's isThenable util is fixed.
			// if (aborts.includes(name)) {
			// 	throw new Error('Cannot `await` a non-fetching cdn request.');
			// }
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
		},
		has(_, name: string) {
			return (!aborts.includes(name) && (standards.includes(name) || methods.includes(name)));
		}
	};

	return new Proxy(noop, handler);
}

function assertString(input: unknown): asserts input is string {
	if (typeof input !== 'string') throw new TypeError('Invalid input.');
}
