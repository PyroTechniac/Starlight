import { Task, Settings } from 'klasa';

export default class extends Task {

	public async run(): Promise<void> {
		await Promise.all([
			this.client.settings!.sync(),
			this.client.guilds.map((guild): Promise<Settings> => guild.settings.sync()),
			this.client.members.map((member): Promise<Settings> => member.settings.sync()),
			this.client.users.map((user): Promise<Settings> => user.settings.sync())
		]);
	}

}
