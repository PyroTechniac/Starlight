import { Argument, ArgumentStore, Client, KlasaMessage, Possible } from 'klasa';

export default class FloatArgument extends Argument {
	public constructor(client: Client, store: ArgumentStore, file: string[], directory: string) {
		super(client, store, file, directory, { aliases: ['num', 'number'] })
	}

	public run(arg: string, possible: Possible, message: KlasaMessage): number | null {
		const { min, max } = possible;
		const num = Number.parseFloat(arg);
		if (isNaN(num)) throw message.language.get('RESOLVER_INVALID_FLOAT', possible.name);
		// @ts-ignore
		return (this.constructor as typeof Argument).minOrMax(this.client, number, min, max, possible, message) ? number : null;
	}
}