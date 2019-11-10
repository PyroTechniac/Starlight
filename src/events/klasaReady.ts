import { Event, EventOptions, ScheduledTaskOptions } from 'klasa';
import { Events } from '../lib/types/Enums';
import { ApplyOptions } from '../lib/util/Decorators';
import { initClean } from '@klasa/utils';

const tasks: [string, string, ScheduledTaskOptions?][] = [
	['cleanup', '*/10 * * * *', { catchUp: false }],
	['dbBackup', '@daily', { catchUp: true }]
];

@ApplyOptions<EventOptions>({
	once: true
})
export default class extends Event {

	public async run(): Promise<void> {
		initClean(this.client.token!);
		for (const task of tasks) {
			await this.ensureTask(task);
		}
	}

	private async ensureTask([task, time, data]: [string, string | number | Date, ScheduledTaskOptions?]): Promise<void> {
		const { tasks } = this.client.schedule;
		const found = tasks.find((s): boolean => s.taskName === task && s.task === this.client.tasks.get(task));
		if (found) {
			this.client.emit(Events.Log, `[SCHEDULE] Found task ${found.taskName} (${found.id})`);
		} else {
			const created = await this.client.schedule.create(task, time, data);
			this.client.emit(Events.Log, `[SCHEDULE] Created task ${created.taskName} (${created.id})`);
		}
	}

}
