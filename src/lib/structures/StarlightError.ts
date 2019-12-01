export class StarlightError {

	private readonly _error: Error;
	private readonly _message: string;

	public constructor(message: string, error: ErrorLike = new Error()) {
		this._message = message;
		this._error = StarlightError.resolveError(error);
	}

	public message(debug = false): string {
		return debug ? this._error.message : this._message;
	}

	public toString(): string {
		return this._error.toString();
	}

	private toError(): Error {
		const err = new Error(this.message(true));
		err.name = 'StarlightError';
		return err;
	}

	public static resolve(err: ErrorLike | string | StarlightError): Error {
		if (typeof err === 'string') return new Error(err);
		if (err instanceof this) return new Error(err.message());
		return this.resolveError(err);
	}

	private static resolveError(err: ErrorLike): Error {
		if (err instanceof Error) return err;
		if (err instanceof this) return err.toError();
		const actual = new Error(err.message);
		actual.name = err.name;
		actual.message = err.message;
		if (err.stack) actual.stack = err.stack;
		else Error.captureStackTrace(actual);
		return actual;
	}

}

export interface ErrorLike {
	message: string;
	name: string;
	stack?: string;
}
