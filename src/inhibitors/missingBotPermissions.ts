import { Inhibitor, KlasaMessage, Command } from 'klasa';
import { Permissions, TextChannel, PermissionString } from 'discord.js';
import { StarlightCommand } from '../lib/structures/StarlightCommand';
import { PERMS } from '../lib/util/Constants';

export default class extends Inhibitor {

	private implied = new Permissions(515136).freeze();

	public run(message: KlasaMessage, command: Command): void {
		let missing: PermissionString[];

		if (message.guild) {
			const textchannel = message.channel as TextChannel;
			const permissions = textchannel.permissionsFor(message.guild.me!);
			if (!permissions) throw 'Failed to fetch permissions.';
			missing = permissions.missing(command.requiredPermissions, false);

			if (command instanceof StarlightCommand && command.requiredGuildPermissions.bitfield !== 0) {
				const guildPermissions = message.guild.me!.permissions;
				missing = [...new Set(guildPermissions.missing(command.requiredGuildPermissions, false))];
			}
		} else {
			missing = this.implied.missing(command.requiredPermissions, false);
		}

		if (missing.length) {
			throw message.language.get('INHIBITOR_MISSING_BOT_PERMS', missing.map(perm => PERMS[perm]).join(', '));
		}
	}

}
