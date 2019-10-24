import { Inhibitor, InhibitorOptions, KlasaMessage } from 'klasa';
import { BankCommand } from '../lib/structures/BankCommand';
import { ApplyOptions } from '../lib/util/Decorators';

@ApplyOptions<InhibitorOptions>({
	spamProtection: true
})
export default class extends Inhibitor {

	public run(message: KlasaMessage, command: BankCommand): void {
		if (!(command instanceof BankCommand) || !command.authenticated) return;

		if (!message.author.account.authenticated) throw message.language.get('INHIBITOR_AUTHENTICATED_NOT');
	}

}
