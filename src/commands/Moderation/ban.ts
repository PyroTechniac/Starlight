import {} from 'discord.js'
import {ModLog} from '../../lib'
import { Command, CommandStore, KlasaClient } from 'klasa';
import { KlasaMessage } from 'klasa';
import { KlasaUser } from 'klasa';

export default class BanCommand extends Command {
	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			name: 'ban',
			permissionLevel: 5,
			requiredPermissions: ['BAN_MEMBERS'],
			runIn: ['text'],
			description: (language): string => language.get('COMMAND_BAN_DESCRIPTION'),
			usage: '<user:user> [days:int{1,7}] [reason:string] [...]',
			usageDelim: ' '
		})
	}

	public async run(msg: KlasaMessage, [user, days = 0, ...reason]: [KlasaUser, number, string[]]): Promise<KlasaMessage | KlasaMessage[]> {
		const newReason = reason.length > 0 ? reason.join(' ') : null;

		const member = await this.client.util.fetchMember(msg.guild!, user.id, true);

		if (!member) {}
		else if (member.roles.highest.position > msg.member!.roles.highest.position) {
			return msg.send(`${msg.language.get('DEAR')} ${msg.author!}, ${msg.language.get('POSITION')}`)
		} else if (member.bannable === false) {
			return msg.send(`${msg.language.get('DEAR')} ${msg.author!}, ${msg.language.get('COMMAND_BAN_FAIL_BANNABLE')}`)
		}
	}
}