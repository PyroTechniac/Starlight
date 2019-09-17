import { Constructor } from 'discord.js';
import { Piece, PieceOptions, Store, util } from 'klasa';
import nodeFetch, { RequestInfo, RequestInit } from 'node-fetch';
import { Stream } from 'stream';

export function createClassDecorator(fn: Function): Function {
	return fn;
}

export function ApplyOptions<T extends PieceOptions>(options: T): Function {
	return createClassDecorator((target: Constructor<Piece>): typeof Piece => class extends target {

		public constructor(store: Store<string, Piece, typeof Piece>, file: string[], dir: string) {
			super(store, file, dir, options);
		}

	});
}

export const fetch = async<T = Record<string, unknown>>(url: RequestInfo, init?: RequestInit): Promise<T> => (await nodeFetch(url, init)).json();

export const noop = (): null => null;

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

export const isStream = (input: unknown): input is Stream => input && typeof (input as Stream).pipe === 'function';

export const filterArray = <T>(...entries: T[]): T[] => [...new Set([...entries])];

export const makeArgRegex = (arg: string, boundary: boolean = false): RegExp => new RegExp(boundary ? `\\b${util.regExpEsc(arg)}\\b` : util.regExpEsc(arg), 'i');
