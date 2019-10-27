import { Constructor, CacheableClass } from '../types/Types';
import { KlasaMessage, Piece, PieceOptions, Store, RateLimitManager, ArgResolverCustomMethod, Command, CommandStore, CommandOptions, Possible } from 'klasa';
import { ApiRequest } from '../structures/api/ApiRequest';
import { ApiResponse } from '../structures/api/ApiResponse';
import { Util } from 'klasa-dashboard-hooks';
import { CLIENT_SECRET } from './Constants';
import { CacheEntry, CachedClass } from '../types/Interfaces';
import Collection from '@discordjs/collection';

/* eslint-disable func-names */

// Copyright (c) 2019 kyranet. All rights reserved. MIT License
// This is a recreation of kyranet's klasa-decorators but with proper type annotation.
// The original work can be found at https://github.com/kyranet/klasa-decorators.

function createSingleCacheKey(param: any): string {
	switch (typeof param) {
		case 'undefined': {
			return '';
		}
		case 'object': {
			if (param === null) {
				return '';
			}
			if ('cacheKey' in param) {
				return param.cacheKey;
			}
			const objKey = JSON.stringify(param);
			if (objKey !== '{}') {
				return objKey;
			}
		}
		// fallthrough
		default: {
			return param.toString();
		}
	}
}

export function createCacheKey(propName: string, params: any[], prefix?: boolean): string {
	return [propName, ...params.map(createSingleCacheKey)].join('/') + (prefix ? '/' : '');
}
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
export function Cacheable<T extends Constructor>(cls: T): CacheableClass<T> {
	return class extends cls implements CachedClass {

		cache: Collection<string, CacheEntry> = new Collection();

		getFromCache(cacheKey: string): any | undefined {
			this._cleanCache();
			if (this.cache.has(cacheKey)) {
				const entry = this.cache.get(cacheKey);

				if (entry) return entry.value;
			}

			return undefined;
		}

		setCache(cacheKey: string, value: any, timeInSeconds: number): void {
			this.cache.set(cacheKey, {
				value,
				expires: Date.now() + (timeInSeconds * 1000)
			});
		}

		removeFromCache(cacheKey: string | string[], prefix?: boolean): void {
			let internalCacheKey: string;
			if (typeof cacheKey === 'string') {
				internalCacheKey = cacheKey;
				if (!internalCacheKey.endsWith('/')) {
					internalCacheKey += '/';
				}
			} else {
				const propName = cacheKey.shift()!;
				internalCacheKey = createCacheKey(propName, cacheKey, prefix);
			}
			if (prefix) {
				this.cache.forEach((val, key) => {
					if (key.startsWith(internalCacheKey)) {
						this.cache.delete(key);
					}
				});
			} else {
				this.cache.delete(internalCacheKey);
			}
		}

		_cleanCache(): void {
			const now = Date.now();
			this.cache.forEach((val, key) => {
				if (val.expires < now) {
					this.cache.delete(key);
				}
			});
		}

	} as unknown as CacheableClass<T>;
}
/* eslint-enable @typescript-eslint/explicit-member-accessibility */

export function Cached<C = unknown>(timeInSeconds = Infinity, cacheFailures = false): Function {
	return function(target: CacheableClass<C>, propName: string, descriptor: PropertyDescriptor): PropertyDescriptor {
		const originFn = descriptor.value;

		descriptor.value = async function(this: CacheableClass<C>, ...params: any[]): Promise<any> {
			const cacheKey = createCacheKey(propName, params);
			const cachedValue = this.getFromCache(cacheKey);

			if (cachedValue) {
				return cachedValue;
			}

			const result = await originFn.apply(this, params);
			// eslint-disable-next-line no-eq-null
			if (result != null || cacheFailures) {
				this.setCache(cacheKey, result, timeInSeconds);
			}

			return result;
		};

		return descriptor;
	};
}

export function CachedGetter<C = unknown>(timeInSeconds = Infinity) {
	return function(target: CacheableClass<C>, propName: string, descriptor: PropertyDescriptor): PropertyDescriptor {
		if (descriptor.get) {
			// eslint-disable-next-line @typescript-eslint/unbound-method
			const originFn = descriptor.get;
			// eslint-disable-next-line @typescript-eslint/unbound-method
			descriptor.get = function(this: CacheableClass<C>, ...params: any[]): any {
				const cacheKey = createCacheKey(propName, params);
				const cachedValue = this.getFromCache(cacheKey);

				if (cachedValue) {
					return cachedValue;
				}

				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				const result = originFn.apply(this, params);
				this.setCache(cacheKey, result, timeInSeconds);
				return result;
			};
		}

		return descriptor;
	};
}

export function ClearsCache<T, C = unknown>(cacheName: keyof T, numberOfArguments?: number) {
	return function(target: CacheableClass<C>, propName: string, descriptor: PropertyDescriptor): PropertyDescriptor {
		const originFn = descriptor.value;

		descriptor.value = async function(this: CacheableClass<C>, ...params: any[]): Promise<any> {
			const result = await originFn.apply(this, params);
			const args = typeof numberOfArguments === 'undefined' ? params.slice() : params.slice(0, numberOfArguments);
			this.removeFromCache([cacheName, ...args], true);
			return result;
		};

		return descriptor;
	};
}

/* eslint-enable func-names */

export function createMethodDecorator(fn: MethodDecorator): MethodDecorator {
	return fn;
}

export function createClassDecorator(fn: Function): Function {
	return fn;
}

export function ApplyOptions<T extends PieceOptions>(options: T): Function {
	return createClassDecorator((target: Constructor<Piece>): Constructor<Piece> => class extends target {

		public constructor(store: Store<string, Piece, typeof Piece>, file: string[], directory: string) {
			super(store, file, directory, options);
		}

	});
}

export function CreateResolver(name: string, fn: ArgResolverCustomMethod): Function {
	return createClassDecorator((target: Constructor<Command>): Constructor<Command> => class extends target {

		public constructor(store: CommandStore, file: string[], directory: string, options: CommandOptions) {
			super(store, file, directory, options);

			this.createCustomResolver(name, fn);
		}

	});
}

export function CustomizeResponse(name: string, response: string | ((message: KlasaMessage, possible: Possible) => string)): Function {
	return createClassDecorator((target: Constructor<Command>): Constructor<Command> => class extends target {

		public constructor(store: CommandStore, file: string[], directory: string, options: CommandOptions) {
			super(store, file, directory, options);

			this.customizeResponse(name, response);
		}

	});
}

export function createFunctionInhibitor(inhibitor: Inhibitor, fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createMethodDecorator((_target, _propertyKey, descriptor): void => {
		const method = descriptor.value;
		if (!method) throw new Error('Function inhibitors require a [[value]].');
		if (typeof method !== 'function') throw new Error('Function inhibitors can only be applied to functions.');

		descriptor.value = (async function descriptorValue(this: Function, ...args: any[]): Promise<any> {
			const canRun = await inhibitor(...args);
			return canRun ? method.call(this, ...args) : fallback.call(this, ...args);
		}) as unknown as undefined;
	});
}

export function requiresPermission(value: number, fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createFunctionInhibitor((message: KlasaMessage): Promise<boolean> => message.hasAtLeastPermissionLevel(value), fallback);
}

export function requiresGuildContext(fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createFunctionInhibitor((message: KlasaMessage): boolean => message.guild !== null, fallback);
}

export function requiresDMContext(fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createFunctionInhibitor((message: KlasaMessage): boolean => message.guild === null, fallback);
}

export function rateLimit(bucket: number, cooldown: number, auth = false): MethodDecorator {
	const manager = new RateLimitManager(bucket, cooldown);
	const xRateLimitLimit = bucket;
	return createFunctionInhibitor(
		(request: ApiRequest, response: ApiResponse): boolean => {
			const id = (auth ? request.auth!.user_id : request.headers['x-forwarded-for'] || request.connection.remoteAddress) as string;
			const bucket = manager.acquire(id);

			response.setHeader('Date', new Date().toUTCString());
			if (bucket.limited) {
				response.setHeader('Retry-After', bucket.remainingTime.toString());
				return false;
			}

			try {
				bucket.drip();
			} catch { }

			response.setHeader('X-RateLimit-Limit', xRateLimitLimit);
			response.setHeader('X-RateLimit-Remaining', bucket.bucket.toString());
			response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());

			return true;
		},
		(_request: ApiRequest, response: ApiResponse): void => {
			response.error(429);
		}
	);
}

export const authenticated = createFunctionInhibitor(
	(request: ApiRequest): boolean => {
		if (!request.headers.authorization) return false;
		request.auth = Util.decrypt(request.headers.authorization, CLIENT_SECRET);
		if (!request.auth!.user_id || !request.auth!.token) return false;
		return true;
	},
	(_request: ApiRequest, response: ApiResponse): void => {
		response.error(403);
	}
);

export interface Inhibitor {
	(...args: any[]): boolean | Promise<boolean>;
}

export interface Fallback {
	(...args: any[]): unknown;
}
