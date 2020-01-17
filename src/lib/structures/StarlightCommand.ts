import { Command, CommandOptions, CommandStore, KlasaMessage } from 'klasa';
import { PermissionResolvable, Permissions } from 'discord.js';
import { mergeDefault } from '../util/Utils';
import { StarlightUsage } from './StarlightUsage';

export abstract class StarlightCommand extends Command {

	public requiredGuildPermissions: Permissions;

	public constructor(store: CommandStore, file: string[], directory: string, options: StarlightCommandOptions = {}) {
		super(store, file, directory, mergeDefault<StarlightCommandOptions, StarlightCommandOptions>({
			requiredGuildPermissions: 0,
			flags: undefined
		}, options));

		this.requiredGuildPermissions = new Permissions(options.requiredGuildPermissions);

		this.usage = new StarlightUsage(this, options.usage!, options.usageDelim ?? null, options.flags ?? null);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(_message: KlasaMessage): Promise<boolean> | boolean {
		return false;
	}

}

export interface StarlightCommandOptions extends CommandOptions {
	requiredGuildPermissions?: PermissionResolvable;
}
