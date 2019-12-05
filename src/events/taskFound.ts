import { Event, ScheduledTask } from 'klasa';
import { Events } from '../lib/types/Enums';

export default class extends Event {

	public run(task: ScheduledTask): void {
		this.client.emit(Events.Log, `[SCHEDULE] Created task ${task.taskName} (${task.id})`);
	}

}
