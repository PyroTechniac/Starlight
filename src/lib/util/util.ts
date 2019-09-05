import { Constructor } from 'discord.js';
import { Piece, PieceOptions, Store, util } from 'klasa';
import nodeFetch, { RequestInfo, RequestInit } from 'node-fetch';

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

export const fetch = async<T = Record<string, any>>(url: RequestInfo, init?: RequestInit): Promise<T> => (await nodeFetch(url, init)).json();

export const noop = (): null => null;

export function enumerable(value: boolean): (target: any, key: string) => void {
	return (target: any, key: string): void => {
		Object.defineProperty(target, key, {
			enumerable: value,
			set(this: any, val: any): void {
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

export function configurable(value: boolean): (target: any, key: string) => void {
	return (target: any, key: string): void => {
		Object.defineProperty(target, key, {
			configurable: value,
			set(this: any, val: any): void {
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

export const filterArray = <T>(...entries: T[]): T[] => Array.from(new Set([...entries]));

export const makeArgRegex = (arg: string, boundary: boolean = false): RegExp => new RegExp(boundary ? `\\b${util.regExpEsc(arg)}\\b` : util.regExpEsc(arg), 'i');
