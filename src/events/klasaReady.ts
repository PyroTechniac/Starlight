import { Event, EventOptions, ScheduledTaskOptions } from 'klasa';
import { ClientSettings } from '../lib/settings/ClientSettings';
import { Events } from '../lib/types/Enums';
import { ApplyOptions } from '../lib/util/Decorators';
import { StarlightError } from '../lib/util/StarlightErrors';
const backupData = { folder: './backup/' };

const tasks: [string, string, ScheduledTaskOptions?][] = [
	['jsonBackup', '@daily', { catchUp: true, data: backupData }],
	['tomlBackup', '@daily', { catchUp: true, data: backupData }],
	['rethinkSync', '*/10 * * * *', { catchUp: false }]
];

@ApplyOptions<EventOptions>({
	once: true
})
export default class extends Event {

	public async run(): Promise<void> {
		for (const task of tasks) {
			await this.ensureTask(task);
		}
	}

	private async ensureTask([task, time, data]: [string, string | number | Date, ScheduledTaskOptions?]): Promise<void> {
		const tasks = this.client.settings!.get(ClientSettings.Schedules);
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
