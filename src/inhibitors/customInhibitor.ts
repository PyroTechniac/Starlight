import { Inhibitor, KlasaMessage } from 'klasa';
import { StarlightCommand } from '../lib/structures/StarlightCommand';

export default class extends Inhibitor {

	public async run(message: KlasaMessage, command: StarlightCommand): Promise<boolean | void> {
		if ('inhibit' in command && await command.inhibit(message)) throw true;
	}

}
