import { Constructor } from '../types/Types';
import { KlasaMessage, Piece, PieceOptions, Store, RateLimitManager, ArgResolverCustomMethod, Command, CommandStore, CommandOptions, Possible } from 'klasa';
import { ApiRequest } from '../structures/api/ApiRequest';
import { ApiResponse } from '../structures/api/ApiResponse';
import { Util } from 'klasa-dashboard-hooks';
import { CLIENT_SECRET } from './Constants';

// Copyright (c) 2019 kyranet. All rights reserved. MIT License
// This is a recreation of kyranet's klasa-decorators but with proper type annotation.
// The original work can be found at https://github.com/kyranet/klasa-decorators.

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
