import * as TOML from '@iarna/toml';
import { isThenable } from '@klasa/utils';
import { Message, Client as DJSClient } from 'discord.js';
import { mkdirs, readFile, writeFile, writeFileAtomic } from 'fs-nextra';
import { Schema, SchemaFolder, SchemaEntry } from 'klasa';
import nodeFetch, { RequestInit, Response } from 'node-fetch';
import { dirname, join } from 'path';
import { URL } from 'url';
import { UserSettings } from '../settings/UserSettings';
import { BaseColors, Events } from '../types/Enums';
import { ReadTOMLOptions, ReferredPromise, TomlOptions } from '../types/Interfaces';
import { rootFolder } from './Constants';

const stripBom = (content: string | Buffer): string => {
	if (Buffer.isBuffer(content)) content = content.toString('utf8');
	return content.replace(/^\uFEFF/, '');
};

export function isSchemaFolder(input: Schema | SchemaFolder | SchemaEntry): input is SchemaFolder | Schema {
	return input.type === 'Folder';
}


export async function readTOML(file: string, options: ReadTOMLOptions | BufferEncoding = { flag: 'r' }): Promise<any> {
	if (typeof options === 'string') options = { encoding: options, flag: 'r' };
	const content = await readFile(file, options);
	return TOML.parse(stripBom(content));
}

export async function writeTOML(file: string, object: any, atomic?: boolean): Promise<void>;
export async function writeTOML(file: string, object: any, options?: TomlOptions, atomic?: boolean): Promise<void>;
export async function writeTOML(file: string, object: any, options: TomlOptions | boolean = {}, atomic = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];

	const writeMethod = atomic ? writeFileAtomic : writeFile;
	await writeMethod(file, `${TOML.stringify(object)}`);
}

export async function writeTOMLAtomic(file: string, object: any, options: TomlOptions = {}): Promise<void> {
	return writeTOML(file, object, options, true);
}

export async function outputTOML(file: string, data: any, atomic?: boolean): Promise<void>;
export async function outputTOML(file: string, data: any, options?: TomlOptions, atomic?: boolean): Promise<void>;
export async function outputTOML(file: string, data: any, options?: TomlOptions | boolean, atomic = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];
	await mkdirs(dirname(file));
	return writeTOML(file, data, options, atomic);
}

export async function outputTOMLAtomic(file: string, data: any, options?: TomlOptions): Promise<void> {
	return outputTOML(file, data, options, true);
}

export function splitText(str: string, length: number, char = ' '): string {
	const x = str.substring(0, length).lastIndexOf(char);
	const pos = x === -1 ? length : x;
	return str.substring(0, pos);
}

export function getColor(message: Message): number {
	return message.author.settings.get(UserSettings.Color) || (message.member && message.member.displayColor) || BaseColors.Primary;
}

export function cutText(str: string, length: number): string {
	if (str.length < length) return str;
	const cut = splitText(str, length - 3);
	if (cut.length < length - 3) return `${cut}...`;
	return `${cut.slice(0, length - 3)}...`;
}

export function createReferPromise<T>(): ReferredPromise<T> {
	let resolve: (value?: T) => void;
	let reject: (error?: Error) => void;
	const promise: Promise<T> = new Promise((res, rej): void => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve: resolve!, reject: reject! };
}

export function floatPromise<T>(ctx: { client: DJSClient }, prom: Promise<T>): Promise<T> {
	if (isThenable(prom)) {
		prom.catch((err): any => {
			ctx.client.emit(Events.Wtf, err);
			return err;
		});
	}
	return prom;
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

export function filterArray<T>(...entries: T[]): T[] {
	return Array.from(new Set([...entries]));
}

export function assetsFolder(...paths: string[]): string {
	return join(rootFolder, 'assets', ...paths);
}
