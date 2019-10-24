import { User } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { BankCommand } from '../../lib/structures/BankCommand';
import { BankCommandOptions } from '../../lib/types/Interfaces';
import { ApplyOptions } from '../../lib/util/Decorators';

@ApplyOptions<BankCommandOptions>({
	authenticated: false,
	usage: '[user:user]'
})
export default class extends BankCommand {

	public async run(message: KlasaMessage, [user = message.author]: [User]): Promise<KlasaMessage> {
		if (user.bot) throw message.language.get('COMMAND_BALANCE_BOTS');

		await user.settings.sync();

		return user === message.author
			? message.sendLocale('COMMAND_BALANCE_SELF', [user.account.balance.toLocaleString()])
			: message.sendLocale('COMMAND_BALANCE', [user.username, user.account.balance.toLocaleString()]);
	}

}
