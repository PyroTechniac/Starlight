import { GuildMember } from 'discord.js';
import { Event, EventOptions, ScheduledTaskOptions, Settings } from 'klasa';
import { ApplyOptions, ClientSettings, Events, StarlightError } from '../lib';

const tasks: [string, string, ScheduledTaskOptions?][] = [
	['jsonBackup', '@daily', { catchUp: false }],
	['syncSettings', '*/10 * * * *', { catchUp: false, data: { syncCount: 0 } }]
];

@ApplyOptions<EventOptions>({
	once: true
})
export default class extends Event {

	public async run(): Promise<void> {
		await this.client.settings!.update(ClientSettings.Owners, [...this.client.owners.values()], { arrayAction: 'overwrite' });

		await Promise.all([
			this.client.settings!.sync(),
			this.client.guilds.map((guild): Promise<Settings> => guild.settings.sync()),
			this.members.map((member): Promise<Settings> => member.settings.sync()),
			this.client.users.map((user): Promise<Settings> => user.settings.sync())
		]);

		for (const task of tasks) {
			await this.ensureTask(task);
		}

		this.client.emit(Events.Log, `[READY] ${this.client.user!.username} initialization complete.`);
	}

	private get members(): GuildMember[] {
		const members: GuildMember[] = [];
		return members.concat(...this.client.guilds.map((guild): GuildMember[] => Array.from(guild.members.values())));
	}

	private async ensureTask([task, time, data]: [string, string | number | Date, ScheduledTaskOptions?]): Promise<void> {
		const tasks = this.client.settings!.get(ClientSettings.Schedules) as ClientSettings.Schedules;
		if (!this.client.tasks.has(task)) throw new StarlightError('NOT_FOUND').init(`task ${task}`);
		const found = tasks.find((s): boolean => s.taskName === task);
		if (found) {
			this.client.emit(Events.Log, `[SCHEDULE] Found task ${found.taskName} (${found.id})`);
		} else {
			const created = await this.client.schedule.create(task, time, data);
			this.client.emit(Events.Log, `[SCHEDULE] Created task ${created.taskName} (${created.id})`);
		}
	}

}
