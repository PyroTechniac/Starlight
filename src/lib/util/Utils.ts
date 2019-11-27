import { isThenable } from '@klasa/utils';
import { Message, Client as DJSClient } from 'discord.js';
import { Schema, SchemaFolder, SchemaEntry } from 'klasa';
import nodeFetch, { RequestInit, Response } from 'node-fetch';
import { join } from 'path';
import { URL } from 'url';
import { UserSettings } from '../settings/UserSettings';
import { BaseColors, Events } from '../types/Enums';
import { ReferredPromise } from '../types/Interfaces';
import { rootFolder } from './Constants';
import { FetchError } from './FetchError';

export * from './FS';

export function isSchemaFolder(input: Schema | SchemaFolder | SchemaEntry): input is SchemaFolder | Schema {
	return input.type === 'Folder';
}

// Synonymous for `throw` but allows throwing in one-line arrow functions
export function toss(exception: any): never {
	throw exception;
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

const kFloatedPromises = new WeakSet<Promise<unknown>>();

export function floatPromise<T>(ctx: { client: DJSClient }, prom: Promise<T>): Promise<T> {
	if (isThenable(prom)) {
		prom.catch((err): any => { // eslint-disable-line @typescript-eslint/no-floating-promises
			ctx.client.emit(Events.Wtf, err);
			return err;
		})
			.finally((): boolean => kFloatedPromises.delete(prom));
		kFloatedPromises.add(prom);
	}
	return prom;
}

export const enum FetchType {
	Result,
	JSON,
	Buffer,
	Text
}

export async function fetch(url: URL | string, type: FetchType.JSON): Promise<object>;
export async function fetch(url: URL | string, options: RequestInit, type: FetchType.JSON): Promise<object>;
export async function fetch(url: URL | string, type: FetchType.Buffer): Promise<Buffer>;
export async function fetch(url: URL | string, options: RequestInit, type: FetchType.Buffer): Promise<Buffer>;
export async function fetch(url: URL | string, type: FetchType.Text): Promise<string>;
export async function fetch(url: URL | string, options: RequestInit, type: FetchType.Text): Promise<string>;
export async function fetch(url: URL | string, type: FetchType.Result): Promise<Response>;
export async function fetch(url: URL | string, options: RequestInit, type: FetchType.Result): Promise<Response>;
export async function fetch(url: URL | string, options: RequestInit, type: FetchType): Promise<Response | Buffer | string | object>;
export async function fetch(url: URL | string, options: RequestInit | FetchType, type?: FetchType): Promise<Response | Buffer | string | object> {
	if (typeof options === 'undefined') {
		options = {};
		type = FetchType.JSON;
	} else if (typeof options === 'number') {
		type = options;
		options = {};
	} else if (typeof type === 'undefined') {
		type = FetchType.JSON;
	}

	const result: Response = await nodeFetch(url, options);
	if (!result.ok) throw new FetchError(await result.text(), result.status, result.url);

	switch (type) {
		case FetchType.Result: return result;
		case FetchType.Buffer: return result.buffer();
		case FetchType.JSON: return result.json();
		case FetchType.Text: return result.text();
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
