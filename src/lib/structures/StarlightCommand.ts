import { Command, KlasaMessage } from 'klasa';
import { StarlightError } from '../util';
/* eslint-disable @typescript-eslint/no-unused-vars */

export abstract class StarlightCommand<T = unknown> extends Command {

	public async run(message: KlasaMessage, ...args: unknown[]): Promise<KlasaMessage | KlasaMessage[] | null> {
		const prehandled: T = await this.preRun(message, args);

		const response = await this.execute(message, [prehandled, ...args]);

		await this.postRun(message, [prehandled, ...args], response);

		return response;
	}

	public async execute(message: KlasaMessage, args: [T, ...unknown[]]): Promise<KlasaMessage | KlasaMessage[] | null> {
		throw new StarlightError('NOT_IMPLEMENTED').init('Command', 'execute');
	}

	public async postRun(message: KlasaMessage, args: [T, ...unknown[]], response: KlasaMessage | KlasaMessage[] | null): Promise<void> {

	}

	public async abstract preRun(message: KlasaMessage, args: unknown[]): Promise<T>;

}
