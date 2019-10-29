import { Argument, Command, KlasaMessage, Possible } from 'klasa';
import { FuzzySearch } from '../lib/util/FuzzySearch';

export default class extends Argument {

	public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<Command> {
		const commandFound = this.client.commands.get(arg.toLowerCase());
		if (commandFound) return commandFound;

		const usableCommands = await message.usableCommands();
		const filter = (command: Command): boolean => usableCommands.has(command.name);

		const command = await new FuzzySearch(this.client.commands, (command): string => command.name, filter).run(message, arg, possible.min || undefined);
		if (command) return command[1];

		throw message.language.get('RESOLVER_INVALID_PIECE', possible.name, 'command');
	}

}