import { PieceOptions, Piece, Store, util } from 'klasa';
import { Constructor } from 'discord.js';
import nodeFetch, { RequestInfo, RequestInit } from 'node-fetch';

export function createClassDecorator(fn: Function): Function {
	return fn;
}

export function ApplyOptions<T extends PieceOptions>(options: T) {
	return createClassDecorator((target: Constructor<Piece>) => class extends target {

		public constructor(store: Store<string, Piece, typeof Piece>, file: string[], dir: string) {
			super(store, file, dir, options);
		}

	});
}

export const fetch = async<T = Record<string, any>> (url: RequestInfo, init?: RequestInit): Promise<T> => (await nodeFetch(url, init)).json();

export const noop = (): null => null;

export function enumerable(value: boolean) {
	return (target: any, key: string) => {
		Object.defineProperty(target, key, {
			enumerable: value,
			set(this: any, val: any) {
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

export async function iteratePromises<T>(iterable: (Promise<T> | T)[]): Promise<T[]> {
	const promises: T[] = [];
	for (const prom of iterable) {
		let resolved: T | any;
		try {
			resolved = util.isThenable(prom) ? await prom : await (Promise.resolve(prom));
		} catch (error) {
			resolved = error;
		}
		promises.push(resolved);
	}

	return promises;
}
