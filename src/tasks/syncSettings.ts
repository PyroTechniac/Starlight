import { Task, Settings } from 'klasa';
import { GuildMember, Collection, GuildMemberStore } from 'discord.js';
import { ClientSettings } from '../lib';

export default class extends Task {

	public async run({ syncCount }: { syncCount: number }): Promise<void> {
		await this.client.settings!.sync();
		await this.client.settings!.update(ClientSettings.SyncCount, syncCount === 3 ? 0 : syncCount + 1);
		const force = syncCount === 3;
		await Promise.all([
			this.members.map((member): Promise<Settings> => member.settings.sync(force)),
			this.client.guilds.map((guild): Promise<Settings> => guild.settings.sync(force)),
			this.client.users.map((user): Promise<Settings> => user.settings.sync(force))
		]);
	}

	private get members(): GuildMember[] {
		const members = new Collection<string, GuildMember>();
		const colls: GuildMemberStore[] = [];
		for (const guild of this.client.guilds.values()) colls.push(guild.members);
		return Array.from(members.concat(...colls).values());
	}

}
