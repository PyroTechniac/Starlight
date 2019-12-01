import { Event, EventOptions, ScheduledTaskOptions } from 'klasa';
import { Events } from '../lib/types/Enums';
import { ApplyOptions } from '../lib/util/Decorators';
import { initClean } from '@klasa/utils';

const tasks: [string, string, ScheduledTaskOptions?][] = [
	['dbBackup', '@daily', { catchUp: true }]
];

@ApplyOptions<EventOptions>({
	once: true
})
export default class extends Event {

	public async run(): Promise<void> {
		initClean(this.client.token!);
		for (const task of tasks) {
			await this.ensureTask(...task);
		}
	}

	private async ensureTask(task: string, time: string | number | Date, data?: ScheduledTaskOptions): Promise<boolean> {
		const { tasks } = this.client.schedule;
		const found = tasks.find((s): boolean => s.taskName === task && s.task === this.client.tasks.get(task));
		if (found) {
			this.client.emit(Events.Log, `[SCHEDULE] Found task ${found.taskName} (${found.id})`);
			return false;
		}
		const created = await this.client.schedule.create(task, time, data);
		this.client.emit(Events.Log, `[SCHEDULE] Created task ${created.taskName} (${created.id})`);
		return true;

	}

}
