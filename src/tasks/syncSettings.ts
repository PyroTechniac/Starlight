import { GuildMember } from 'discord.js';
import { Settings, Task } from 'klasa';

export default class extends Task {

	public async run(): Promise<void> {
		await Promise.all([
			this.client.settings!.sync(true),
			this.members.map((member): Promise<Settings> => member.settings.sync(true)),
			this.client.guilds.map((guild): Promise<Settings> => guild.settings.sync(true)),
			this.client.users.map((user): Promise<Settings> => user.settings.sync(true))
		]);
	}

	private get members(): GuildMember[] {
		const members: GuildMember[] = [];
		return members.concat(...this.client.guilds.map((guild): GuildMember[] => Array.from(guild.members.values())));
	}

}
