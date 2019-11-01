import { KlasaMessage } from 'klasa';

export class Flag {

	public type: string;

	public constructor(type: string, data: object = {}) {
		this.type = type;
		Object.assign(this, data);
	}

	public static cancel(): Flag {
		return new Flag('cancel');
	}

	public static retry(message: KlasaMessage): RetryFlag {
		return new Flag('retry', { message }) as RetryFlag;
	}

	public static fail(value: any): FailFlag {
		return new Flag('fail', { value }) as FailFlag;
	}

	public static continue(command: string, ignore = false, rest: string | null = null): ContinueFlag {
		return new Flag('continue', { command, ignore, rest }) as ContinueFlag;
	}

	public static is(value: any, type: 'cancel'): value is CancelFlag;
	public static is(value: any, type: 'continue'): value is ContinueFlag;
	public static is(value: any, type: 'retry'): value is RetryFlag;
	public static is(value: any, type: 'fail'): value is FailFlag;
	public static is(value: any, type: string): value is Flag {
		return value instanceof Flag && value.type === type;
	}

}

export interface CancelFlag extends Flag {
	type: 'cancel';
}

export interface RetryFlag extends Flag {
	type: 'retry';
	message: KlasaMessage;
}

export interface FailFlag extends Flag {
	type: 'fail';
	value: any;
}

export interface ContinueFlag extends Flag {
	command: string;
	ignore: boolean;
	rest: string | null;
}
