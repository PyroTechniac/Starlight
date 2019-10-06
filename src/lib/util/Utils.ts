import { util } from 'klasa';
import nodeFetch, { RequestInit, Response } from 'node-fetch';
import { Stream } from 'stream';
import { URL } from 'url';

export function generateRegExp(str: string): string {
	return str.replace(/\w(?=(\w)?)/g, (letter, nextWord): string => `${letter}-${nextWord ? '\\W*' : ''}`);
}


export async function fetch(url: URL | string, type: 'json'): Promise<object>;
export async function fetch(url: URL | string, options: RequestInit, type: 'json'): Promise<object>;
export async function fetch(url: URL | string, type: 'buffer'): Promise<Buffer>;
export async function fetch(url: URL | string, options: RequestInit, type: 'buffer'): Promise<Buffer>;
export async function fetch(url: URL | string, type: 'text'): Promise<string>;
export async function fetch(url: URL | string, options: RequestInit, type: 'text'): Promise<string>;
export async function fetch(url: URL | string, type: 'result'): Promise<Response>;
export async function fetch(url: URL | string, options: RequestInit, type: 'result'): Promise<Response>;
export async function fetch(url: URL | string, options: RequestInit, type: 'result' | 'json' | 'buffer' | 'text'): Promise<Response | Buffer | string | object>;
export async function fetch(url: URL | string, options: RequestInit | 'result' | 'json' | 'buffer' | 'text', type?: 'result' | 'json' | 'buffer' | 'text'): Promise<Response | Buffer | string | object> {
	if (typeof options === 'undefined') {
		options = {};
		type = 'json';
	} else if (typeof options === 'string') {
		type = options;
		options = {};
	} else if (typeof type === 'undefined') {
		type = 'json';
	}

	const result: Response = await nodeFetch(url, options);
	if (!result.ok) throw result.status;

	switch (type) {
		case 'result': return result;
		case 'buffer': return result.buffer();
		case 'json': return result.json();
		case 'text': return result.text();
		default: throw new Error(`Unknown type ${type}`);
	}
}

export function noop(): null {
	return null;
}

export function enumerable(value: boolean): (target: unknown, key: string) => void {
	return (target: unknown, key: string): void => {
		Object.defineProperty(target, key, {
			enumerable: value,
			set(this: unknown, val: unknown): void {
				Object.defineProperty(this, key, {
					configurable: true,
					enumerable: value,
					value: val,
					writable: true
				});
			}
		});
	};
}

export function configurable(value: boolean): (target: unknown, key: string) => void {
	return (target: unknown, key: string): void => {
		Object.defineProperty(target, key, {
			configurable: value,
			set(this: unknown, val: unknown): void {
				Object.defineProperty(this, key, {
					configurable: value,
					enumerable: true,
					value: val,
					writable: true
				});
			}
		});
	};
}

export function isStream(input: unknown): input is Stream {
	return input && typeof (input as Stream).pipe === 'function';
}

export function filterArray<T>(...entries: T[]): T[] {
	return Array.from(new Set([...entries]));
}

export function makeArgRegex(arg: string, boundary: boolean = false): RegExp {
	return new RegExp(boundary ? `\\b${util.regExpEsc(arg)}\\b` : util.regExpEsc(arg), 'i');
}
