import {
	KlasaMessage,
	Piece,
	PieceOptions,
	RateLimitManager, ScheduledTask,
	ScheduledTaskOptions,
	Store,
	Task
} from 'klasa';
import { ApiRequest, ApiResponse } from '../structures/ApiObjects';
import {Route, RouteStore, Util} from 'klasa-dashboard-hooks';
import { CLIENT_SECRET } from './Constants';
import { Constructor } from '../types/Types';
import { isFunction } from '@klasa/utils';
import { Events, PermissionLevels } from '../types/Enums';
import { toss } from './Utils';

export { Deferrable, markDefer } from './Defer';

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

export function ApplyRoute(route: string): Function {
	return createClassDecorator((target: Constructor<Route>): Constructor<Route> => class extends target {
		constructor(store: RouteStore, file: string[], directory: string) {
			super(store, file, directory, {route});
		}
	})
}

function ensureTask(task: Task): ScheduledTask | undefined {
	const { tasks } = task.client.schedule;
	return tasks.find((s): boolean => s.taskName === task.name && s.task === task);
}

interface NonAbstractTask extends Task {
	run(data?: any): unknown;
}

export function SetupTask(time: string | number | Date, data?: ScheduledTaskOptions): Function {
	return createClassDecorator((target: Constructor<NonAbstractTask>): Constructor<NonAbstractTask> => class extends target {

		public async init(): Promise<void> {
			await super.init();
			const found = ensureTask(this);
			if (found) {
				this.client.emit(Events.TaskFound, found);
			} else {
				const created = await this.client.schedule.create(this.name, time, data);
				this.client.emit(Events.TaskScheduled, created);
			}
		}

	});
}

export function createFunctionInhibitor(inhibitor: Inhibitor, fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createMethodDecorator((_target, _propertyKey, descriptor): void => {
		const method = descriptor.value;
		if (!method) throw new Error('Function inhibitors require a [[value]].');
		if (!isFunction(method)) throw new Error('Function inhibitors can only be applied to functions.');

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

function inhibit(level: PermissionLevels): (message: KlasaMessage) => never {
	let toThrow;
	switch (level) {
		case PermissionLevels.Staff: {
			toThrow = 'INHIBITOR_STAFF_LEVEL';
			break;
		}
		case PermissionLevels.Moderator: {
			toThrow = 'INHIBITOR_MOD_LEVEL';
			break;
		}
		case PermissionLevels.Administrator: {
			toThrow = 'INHIBITOR_ADMIN_LEVEL';
			break;
		}
		default: {
			toThrow = 'INHIBITOR_PERMISSIONS';
			break;
		}
	}

	return (message: KlasaMessage): never => toss(message.language.get(toThrow));
}

export function staff(): MethodDecorator {
	return requiresPermission(PermissionLevels.Staff, inhibit(PermissionLevels.Staff));
}

export function mod(): MethodDecorator {
	return requiresPermission(PermissionLevels.Moderator, inhibit(PermissionLevels.Moderator));
}

export function admin(): MethodDecorator {
	return requiresPermission(PermissionLevels.Administrator, inhibit(PermissionLevels.Administrator));
}

export function owner(): MethodDecorator {
	return requiresPermission(PermissionLevels.ServerOwner, inhibit(PermissionLevels.ServerOwner));
}

export function botOwner(): MethodDecorator {
	return requiresPermission(PermissionLevels.BotOwner, inhibit(PermissionLevels.BotOwner));
}

export function ratelimit(bucket: number, cooldown: number, auth = false): MethodDecorator {
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
			} catch {
			}

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
		return !(!request.auth!.user_id || !request.auth!.token);
	},
	(_request: ApiRequest, response: ApiResponse): void => {
		response.error(403);
	}
);

export function enumerable(value: boolean): PropertyDecorator {
	return (target: unknown, key: string | symbol): void => {
		Object.defineProperty(target, key, {
			enumerable: value,
			set(this: unknown, val: unknown) {
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

export interface Inhibitor {
	(...args: any[]): boolean | Promise<boolean>;
}

export interface Fallback {
	(...args: any[]): unknown;
}
