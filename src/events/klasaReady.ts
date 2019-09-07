import { Event, EventOptions, ScheduledTaskOptions } from 'klasa';
import { ApplyOptions, ClientSettings, Events } from '../lib';

@ApplyOptions<EventOptions>({
	once: true
})
export default class extends Event {

	public async run(): Promise<void> {
		await this.client.settings!.update('owners', [...this.client.owners.values()], { arrayAction: 'overwrite' });

		await this.ensureTask('jsonBackup', '@daily', { catchUp: false });

		for (const guild of this.client.guilds.values()) {
			await guild.settings.sync();
			for (const member of guild.members.values()) {
				await member.settings.sync();
			}
		}
		for (const user of this.client.users.values()) {
			await user.settings.sync();
		}

		this.client.emit(Events.LOG, `[READY] ${this.client.user!.username} initialization complete.`);
	}

	private async ensureTask(task: string, time: string | number | Date, data?: ScheduledTaskOptions): Promise<void> {
		const tasks = this.client.settings!.get(ClientSettings.Schedules) as ClientSettings.Schedules;

		const found = tasks.find((s): boolean => s.taskName === task);
		if (found) {
			this.client.emit(Events.LOG, `[SCHEDULE] Found task ${found.taskName} (${found.id})`);
		} else {
			const created = await this.client.schedule.create(task, time, data);
			this.client.emit(Events.LOG, `[SCHEDULE] Created task ${created.taskName} (${created.id})`);
		}
	}

}
