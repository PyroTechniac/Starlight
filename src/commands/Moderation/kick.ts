import { StarlightCommandOptions, StarlightCommand } from '../../lib/structures/StarlightCommand';
import { ApplyOptions } from '../../lib/util/Decorators';
import { PermissionLevels } from '../../lib/types/Enums';
import { KlasaMessage } from 'klasa';
import { GuildMember } from 'discord.js';
// TODO: Localization.

@ApplyOptions<StarlightCommandOptions>({
	permissionLevel: PermissionLevels.Moderator,
	runIn: ['text'],
	requiredPermissions: ['KICK_MEMBERS'],
	description: 'Kicks a member. Currently does not require reason (no mod-log).',
	usage: '<member:member> [reason:...string]',
	usageDelim: ' '
})
export default class extends StarlightCommand {

	public async run(message: KlasaMessage, [member, reason]: [GuildMember, string?]): Promise<KlasaMessage> {
		if (member.id === message.author.id) throw 'Why would you kick yourself?';
		if (member.id === this.client.user!.id) throw 'Have I done something wrong?';

		if (member.roles.highest.position >= message.member!.roles.highest.position) throw 'You cannot kick this user.';
		if (!member.kickable) throw 'I cannot kick this user.';

		await member.kick(reason);
		return message.send(`${member.user.tag} got kick.${reason ? ` With reason of: ${reason}` : ''}`);
	}

}
