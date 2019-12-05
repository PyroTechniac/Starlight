import { Gateway, Settings } from 'klasa';
import { GuildMember } from 'discord.js';

export class MemberGateway extends Gateway {

	public acquire(target: GuildMember, id = `${target.guild.id}.${target.id}`): Settings {
		return super.acquire(target, id);
	}

	public get(id: string): Settings | null {
		const [guildID, memberID] = id.split('.', 2);
		const guild = this.client.guilds.get(guildID);
		const member = guild?.members.get(memberID);
		return (member && member.settings) || null;
	}

	public create(target: GuildMember, id = `${target.guild.id}.${target.id}`): Settings {
		return super.create(target, id);
	}

}
