import { Command, KlasaMessage } from 'klasa';

export abstract class StarlightCommand extends Command {

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(_message: KlasaMessage): Promise<boolean> | boolean {
		return true;
	}

}
