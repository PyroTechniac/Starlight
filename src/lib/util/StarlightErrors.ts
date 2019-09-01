import { Type } from 'klasa';
import { Constructor } from '../types';

const messages: Map<string, (...args: any[]) => string> = new Map([
	['EXPECTED_FOUND', (expected: any, found: any): string => `Expected ${expected}, found ${new Type(found)}.`],
	['DEFAULT', (): string => 'An unknown error occured.']
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

	};
}

@CreateStarlightError()
class StarlightError extends Error {

	private code!: string;
	public init(...args: any[]): this {
		this.message = messages.has(this.code) ? messages.get(this.code)!(...args) : messages.get('DEFAULT')!(...args);

		return this;
	}

}

@CreateStarlightError()
class StarlightTypeError extends TypeError {

	private code!: string;
	public init(...args: any[]): this {
		this.message = messages.has(this.code) ? messages.get(this.code)!(...args) : messages.get('DEFAULT')!(...args);

		return this;
	}

}

@CreateStarlightError()
class StarlightRangeError extends RangeError {

	private code!: string;
	public init(...args: any[]): this {
		this.message = messages.has(this.code) ? messages.get(this.code)!(...args) : messages.get('DEFAULT')!(...args);

		return this;
	}

}

export {
	StarlightError,
	StarlightTypeError,
	StarlightRangeError
};
