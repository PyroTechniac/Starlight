import * as TOML from '@iarna/toml';
import { mkdirs, readFile, writeFile, writeFileAtomic } from 'fs-nextra';
import { util } from 'klasa';
import nodeFetch, { RequestInit, Response } from 'node-fetch';
import { dirname } from 'path';
import { Stream } from 'stream';
import { URL } from 'url';
import { ReadTOMLOptions, TomlOptions } from '../types/Interfaces';

const stripBom = (content: string | Buffer): string => {
	if (Buffer.isBuffer(content)) content = content.toString('utf8');
	return content.replace(/^\uFEFF/, '');
};

export async function readTOML(file: string, options: ReadTOMLOptions | BufferEncoding = { flag: 'r' }): Promise<any> {
	if (typeof options === 'string') options = { encoding: options, flag: 'r' };
	const content = await readFile(file, options);
	return TOML.parse(stripBom(content));
}

export async function writeTOML(file: string, object: any, atomic?: boolean): Promise<void>;
export async function writeTOML(file: string, object: any, options?: TomlOptions, atomic?: boolean): Promise<void>;
export async function writeTOML(file: string, object: any, options: TomlOptions | boolean = {}, atomic: boolean = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];

	const writeMethod = atomic ? writeFileAtomic : writeFile;
	await writeMethod(file, `${TOML.stringify(object)}`);
}

export async function writeTOMLAtomic(file: string, object: any, options: TomlOptions = {}): Promise<void> {
	return writeTOML(file, object, options, true);
}

export async function outputTOML(file: string, data: any, atomic?: boolean): Promise<void>;
export async function outputTOML(file: string, data: any, options?: TomlOptions, atomic?: boolean): Promise<void>;
export async function outputTOML(file: string, data: any, options?: TomlOptions | boolean, atomic: boolean = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];
	await mkdirs(dirname(file));
	return writeTOML(file, data, options, atomic);
}

export async function outputTOMLAtomic(file: string, data: any, options?: TomlOptions): Promise<void> {
	return outputTOML(file, data, options, true);
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
