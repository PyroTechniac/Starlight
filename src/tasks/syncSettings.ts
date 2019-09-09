import { Task, Settings } from 'klasa';
import { GuildMember, Collection, GuildMemberStore } from 'discord.js';

export default class extends Task {

	public async run(): Promise<void> {
		await Promise.all([
			this.client.settings!.sync(),
			this.members.map((member): Promise<Settings> => member.settings.sync()),
			this.client.guilds.map((guild): Promise<Settings> => guild.settings.sync()),
			this.client.users.map((user): Promise<Settings> => user.settings.sync())
		]);
	}

	private get members(): GuildMember[] {
		const members = new Collection<string, GuildMember>();
		const colls: GuildMemberStore[] = [];
		for (const guild of this.client.guilds.values()) colls.push(guild.members);
		return Array.from(members.concat(...colls).values());
	}

}
