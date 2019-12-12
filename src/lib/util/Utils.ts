import { isThenable } from '@klasa/utils';
import { Message, Client as DJSClient } from 'discord.js';
import { Schema, SchemaFolder, SchemaEntry } from 'klasa';
import { join } from 'path';
import { UserSettings } from '../settings/UserSettings';
import { BaseColors, Events } from '../types/Enums';
import { ReferredPromise } from '../types/Interfaces';
import { rootFolder } from './Constants';

export function isSchemaFolder(input: Schema | SchemaFolder | SchemaEntry): input is SchemaFolder | Schema {
	return input.type === 'Folder';
}

// Synonymous for `throw` but allows throwing in one-line arrow functions and ternary statements.
export function toss(exception: any): never {
	throw exception;
}

export function wrapPromise<V, A extends readonly unknown[] = readonly unknown[]>(fn: (...A) => V, ...args: A): Promise<V> {
	return new Promise<V>((resolve, reject): void => {
		try {
			resolve(fn(...args));
		} catch (err) {
			if (err instanceof Error) {
				Error.captureStackTrace(err, wrapPromise);
			}
			reject(err);
		}
	});
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

export function noop(): null {
	return null;
}

export function filterArray<T>(...entries: T[]): T[] {
	return Array.from(new Set([...entries]));
}

export function assetsFolder(...paths: string[]): string {
	return join(rootFolder, 'assets', ...paths);
}
