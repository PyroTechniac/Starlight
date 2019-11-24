import { StarlightCommandOptions, StarlightCommand } from '../../lib/structures/StarlightCommand';
import { ApplyOptions } from '../../lib/util/Decorators';
import { PermissionLevels } from '../../lib/types/Enums';
import { KlasaMessage } from 'klasa';
import { BanOptions, User } from 'discord.js';
import { noop } from '../../lib/util/Utils';
// TODO: Localization.

@ApplyOptions<StarlightCommandOptions>({
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['BAN_MEMBERS'],
	runIn: ['text'],
	description: 'Bans a user. Currently does not require reason (no mod-log).',
	usage: '<member:user> [reason:...string]',
	usageDelim: ' '
})
export default class extends StarlightCommand {

	public async run(message: KlasaMessage, [user, reason]: [User, string?]): Promise<KlasaMessage> {
		if (user.id === message.author.id) throw 'Why would you ban yourself?';
		if (user.id === this.client.user!.id) throw 'Have I done something wrong?';

		const member = await message.guild!.members.fetch(user).catch(noop);
		if (member) {
			if (member.roles.highest.position >= message.member!.roles.highest.position) throw 'You cannot ban this member.';
			if (!member.bannable) throw 'I cannot ban this user.';
		}

		const options: BanOptions = {};
		if (reason) options.reason = reason;

		await message.guild!.members.ban(user, options);
		return message.sendMessage(`${user.tag} got banned.${reason ? ` With reason of: ${reason}` : ''}`);
	}

}
