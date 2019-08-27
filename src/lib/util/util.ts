import { PieceOptions, Piece, Store } from 'klasa';
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
