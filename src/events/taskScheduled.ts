import { Event, ScheduledTask } from 'klasa';
import { Events } from '../lib/types/Enums';

export default class extends Event {

	public run(task: ScheduledTask): void {
		this.client.emit(Events.Log, `[SCHEDULE] Found task ${task.taskName} (${task.id})`);
	}

}
