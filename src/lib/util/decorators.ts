import { KlasaMessage, PieceOptions, Piece, Store } from 'klasa';
import { Constructor } from '../types';

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
	return createClassDecorator((target: Constructor<Piece>): typeof Piece => class extends target {

		public constructor(store: Store<string, Piece, typeof Piece>, file: string[], directory: string) {
			super(store, file, directory, options);
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

export interface Inhibitor {
	(...args: any[]): boolean | Promise<boolean>;
}

export interface Fallback {
	(...args: any[]): unknown;
}
