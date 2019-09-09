import { GuildMember } from 'discord.js';
import { Settings, Task } from 'klasa';
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
		const members: GuildMember[] = [];
		return members.concat(...this.client.guilds.map((guild): GuildMember[] => Array.from(guild.members.values())));
	}

}
