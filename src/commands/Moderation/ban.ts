import { Command, CommandOptions, KlasaMessage, KlasaUser } from 'klasa';
import { ApplyOptions, noop } from '../../lib';
import { BanOptions } from 'discord.js';

@ApplyOptions<CommandOptions>({
	permissionLevel: 6,
	requiredPermissions: ['BAN_MEMBERS'],
	runIn: ['text'],
	description: 'Bans a mentioned user. Currently does not require reason (no mod-log).',
	usage: '<member:user> [reason:...string]',
	usageDelim: ' '
})
export default class extends Command {

	public async run(msg: KlasaMessage, [user, reason]: [KlasaUser, string?]): Promise<KlasaMessage | KlasaMessage[]> {
		if (user.id === msg.author!.id) throw 'Why would you ban yourself?';
		if (user.id === this.client.user!.id) throw 'Have I done something wrong?';

		const member = await msg.guild!.members.fetch(user).catch(noop);
		if (member) {
			if (member.roles.highest.position >= msg.member!.roles.highest.position) throw 'You cannot ban this user.';
			if (!member.bannable) throw 'I cannot ban this user.';
		}

		const options: BanOptions = {};
		if (reason) options.reason = reason;

		await msg.guild!.members.ban(user, options);
		return msg.send(`${user.tag} got banned.${reason ? ` With reason of: ${reason}` : ''}`);
	}

}
