import { Command, CommandStore, util } from 'klasa';
import { BankCommandOptions } from '../types/Interfaces';

export abstract class BankCommand extends Command {

	public authenticated: boolean;

	public constructor(store: CommandStore, file: string[], directory: string, options: BankCommandOptions) {
		super(store, file, directory, util.mergeDefault<BankCommandOptions>({ authenticated: false }, options));

		this.authenticated = options.authenticated!;
	}

}
