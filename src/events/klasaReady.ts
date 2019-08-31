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
			for (const member of guild.members.values()) await member.settings.sync();
		}
	}

	private async ensureTask(task: string, time: string | number | Date, data?: ScheduledTaskOptions): Promise<void> {
		const tasks = this.client.settings!.get(ClientSettings.Schedules) as ClientSettings.Schedules;

		const found = tasks.find((s): boolean => s.taskName === task);
		if (found) {
			this.client.emit(Events.LOG, `Found task ${found.taskName} (${found.id})`);
		} else {
			const created = await this.client.schedule.create(task, time, data);
			this.client.emit(Events.LOG, `Created task ${created.taskName} (${created.id})`);
		}
	}

}
