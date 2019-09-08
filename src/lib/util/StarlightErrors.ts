import { Type } from 'klasa';
import { Constructor } from '../types';
import { enumerable } from './util';

const messages: Map<string, (...args: any[]) => string> = new Map([
	['EXPECTED_FOUND', (expected: any, found: any): string => `Expected ${expected}, found ${new Type(found)}.`],
	['DEFAULT', (): string => 'An unknown error occured.'],
	['NOT_FOUND', (found: any): string => `The ${found} was not found.`]
]);

function CreateStarlightError(): Function {
	return (target: Constructor<Error>): Constructor<Error> => class extends target {

		private code: string;
		public constructor(key: string) {
			super();
			this.code = key;
		}

		public get name(): string {
			return `${super.name} [${this.code}]`;
		}

		public init(...args: any[]): this {
			this.message = messages.has(this.code) ? messages.get(this.code)!(...args) : messages.get('DEFAULT')!(...args);
			return this;
		}

	};
}

@CreateStarlightError()
class StarlightError extends Error {

	@enumerable(false)
	private code!: string;

	public init(...args: any[]): this {
		this.message = (messages.get(this.code) || messages.get('DEFAULT'))!(...args);
		return this;
	}

}

@CreateStarlightError()
class StarlightTypeError extends TypeError {

	@enumerable(false)
	private code!: string;

	public init(...args: any[]): this {
		this.message = (messages.get(this.code) || messages.get('DEFAULT'))!(...args);
		return this;
	}

}

@CreateStarlightError()
class StarlightRangeError extends RangeError {

	@enumerable(false)

	private code!: string;

	public init(...args: any[]): this {
		this.message = (messages.get(this.code) || messages.get('DEFAULT'))!(...args);
		return this;
	}

}

export { StarlightError, StarlightTypeError, StarlightRangeError };

