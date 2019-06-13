import { Event, EventStore, ScheduledTask, ScheduledTaskOptions } from 'klasa';
import { DefaultPresenceData } from '../lib/util';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            once: true
        });
    }

    public async run(): Promise<void> {
        await this.ensureTask('cleanup', '*/8 * * * *', { catchUp: false });
        await this.ensureTask('setPresence', '@hourly', { data: DefaultPresenceData, catchUp: false });

        await this.client.user!.setPresence(DefaultPresenceData);
    }

    private async ensureTask(task: string, time: string | number | Date, data?: ScheduledTaskOptions): Promise<ScheduledTask | void> {
        const { tasks } = this.client.schedule;

        if (!tasks.some((s): boolean => s.taskName === task)) {
            this.client.emit('debug', `Creating task ${task}`);
            return this.client.schedule.create(task, time, data);
        }
    }
}