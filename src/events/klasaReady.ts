import { GuildMember } from 'discord.js';
import { Event, EventOptions, ScheduledTaskOptions, Settings } from 'klasa';
import { ClientSettings } from '../lib/settings/ClientSettings';
import { Events } from '../lib/types/Enums';
import { ApplyOptions } from '../lib/util/Decorators';
import { StarlightError } from '../lib/util/StarlightErrors';
const backupData = { folder: './backup/' };

const tasks: [string, string, ScheduledTaskOptions?][] = [
	['jsonBackup', '@daily', { catchUp: true, data: backupData }],
	['syncSettings', '*/10 * * * *', { catchUp: false }],
	['statsPost', '@daily', { catchUp: true }],
	['tomlBackup', '@daily', { catchUp: true, data: backupData }]
];

@ApplyOptions<EventOptions>({
	once: true
})
export default class extends Event {

	public async run(): Promise<void> {
		await Promise.all([
			this.client.settings!.sync(true),
			Promise.all(this.client.guilds.map((guild): Promise<Settings> => guild.settings.sync(true))),
			Promise.all(this.members.map((member): Promise<Settings> => member.settings.sync(true))),
			Promise.all(this.client.users.map((user): Promise<Settings> => user.settings.sync(true)))
		]);

		await this.client.settings!.update(ClientSettings.Owners, [...this.client.owners.values()], { arrayAction: 'overwrite' });

		for (const task of tasks) {
			await this.ensureTask(task);
		}
		this.client.emit(Events.Log, `[READY] ${this.client.user!.username} initialization complete.`);

		if (this.client.ipc.connected) {
			this.client.emit(Events.Log, '[IPC   ] Sending user data to server');
			await this.client.ipc.sendTo('moonlight-api', ['clientID', [this.client.user!.id, 'starlight']]);
		}
	}

	private get members(): GuildMember[] {
		const members: GuildMember[] = [];
		return members.concat(...this.client.guilds.map((guild): GuildMember[] => Array.from(guild.members.values())));
	}

	private async ensureTask([task, time, data]: [string, string | number | Date, ScheduledTaskOptions?]): Promise<void> {
		const tasks = this.client.settings!.get(ClientSettings.Schedules) as ClientSettings.Schedules;
		if (!this.client.tasks.has(task)) throw new StarlightError('NOT_FOUND', `task ${task}`);
		const found = tasks.find((s): boolean => s.taskName === task);
		if (found) {
			this.client.emit(Events.Log, `[SCHEDULE] Found task ${found.taskName} (${found.id})`);
		} else {
			const created = await this.client.schedule.create(task, time, data);
			this.client.emit(Events.Log, `[SCHEDULE] Created task ${created.taskName} (${created.id})`);
		}
	}

}
