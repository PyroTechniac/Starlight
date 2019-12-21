export class FetchError extends Error {

	public code: number;
	public url: string;

	public constructor(message: string, code: number, url: string) {
		super(message);
		Error.captureStackTrace(this, this.constructor);
		this.code = code;
		this.url = url;
		this.message = message;
	}

	public get name(): string {
		return `FetchError [${this.code}]`;
	}

}
