import { Constructor } from '@typings/Types';
import { enumerable } from '@utils/Utils';
import { Type } from 'klasa';

const messages: Map<string, (...args: unknown[]) => string> = new Map([
	['EXPECTED_FOUND', (expected: any, found: any): string => `Expected ${expected}, found ${new Type(found)}.`],
	['DEFAULT', (): string => 'An unknown error occured.'],
	['NOT_FOUND', (found: any): string => `The ${found} was not found.`]
]);

function CreateStarlightError(): Function {
	return (target: Constructor<Error>): Constructor<Error> => class extends target {

		private code: string;
		public constructor(key: string) {
			super();
			this.code = messages.has(key) ? key : 'DEFAULT';
		}

		public get name(): string {
			return `${super.name} [${this.code}]`;
		}

		public init(...args: any[]): this {
			this.message = messages.get(this.code)!(...args);
			return this;
		}

	};
}

@CreateStarlightError()
class StarlightError extends Error {

	@enumerable(false)
	public code!: string;

}

interface StarlightError extends Error {
	init(...args: any[]): this;
}

@CreateStarlightError()
class StarlightTypeError extends TypeError {

	@enumerable(false)
	public code!: string;

}

interface StarlightTypeError extends TypeError {
	init(...args: any[]): this;
}

@CreateStarlightError()
class StarlightRangeError extends RangeError {

	@enumerable(false)
	public code!: string;

}

interface StarlightRangeError extends RangeError {
	init(...args: any[]): this;
}

export { StarlightError, StarlightTypeError, StarlightRangeError };

