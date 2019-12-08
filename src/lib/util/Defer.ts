import { createClassDecorator, createMethodDecorator } from './Decorators';
import { Constructor } from '../types/Types';
import { isFunction } from '@klasa/utils';

export interface DeferredClass {
	defer(fn: Function, ...args: any[]): void;
}

const kDeferred = Symbol('Deferred');

export function Deferrable(): Function {
	return createClassDecorator((Target: Constructor<DeferredClass>) => class extends Target {

		private [kDeferred]: [Function, any[]][] = [];

		public defer(fn: Function, ...args: any[]): void {
			this[kDeferred].push([fn, args]);
		}

	});
}

export function markDefer(): MethodDecorator {
	return createMethodDecorator((_target, _propertyKey, descriptor): void => {
		const method = descriptor.value;
		if (!method) throw new Error('Deferrable functions require a [[value]].');
		if (!isFunction(method)) throw new Error('Function deferrables can only be applied to functions.');

		descriptor.value = (async function descriptorValue(this: DeferredClass, ...args: readonly unknown[]) {
			if (!this[kDeferred] || !Array.isArray(this[kDeferred])) throw new TypeError('Class not marked as deferrable.');

			try {
				return await Reflect.apply(method, this, args);
			} catch (err) {
				throw err;
			} finally {
				for (const [fn, args] of this[kDeferred]) await Reflect.apply(fn, this, args);
			}
		}) as unknown as undefined;
	});
}
