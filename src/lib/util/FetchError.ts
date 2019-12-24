export class FetchError extends Error {

	public code: number;
	public url: string;

	public constructor(message: string, code: number, url: string, stack?: string) {
		super(message);
		Error.captureStackTrace(this, this.constructor);
		this.code = code;
		this.url = url;
		this.message = message;

		if (stack) {
			const _stack = stack.split('\n');
			_stack[0] = `${this.name}: ${this.message}`;
			this.stack = _stack.join('\n');
		}
	}

	public get name(): string {
		return `FetchError [${this.code}]`;
	}

}
