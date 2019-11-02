import { Command, KlasaMessage, CommandOptions, CommandStore } from 'klasa';
import { Permissions, PermissionResolvable } from 'discord.js';
import { mergeDefault } from '@klasa/utils';

export abstract class StarlightCommand extends Command {

	public requiredGuildPermissions: Permissions;

	public constructor(store: CommandStore, file: string[], directory: string, options: StarlightCommandOptions = {}) {
		super(store, file, directory, mergeDefault<StarlightCommandOptions, StarlightCommandOptions>({ requiredGuildPermissions: 0 }, options));

		this.requiredGuildPermissions = new Permissions(options.requiredGuildPermissions);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(_message: KlasaMessage): Promise<boolean> | boolean {
		return false;
	}

}

export interface StarlightCommandOptions extends CommandOptions {
	requiredGuildPermissions?: PermissionResolvable;
}
