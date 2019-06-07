import { Event, EventStore, ScheduledTaskOptions, ScheduledTask } from 'klasa';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            once: true
        });
    }

    public async run(): Promise<void> {
        await Promise.all([this.ensureTask('jsonBackup', '@daily'), this.ensureTask('cleanup', '*/8 * * * *')]);
    }

    private async ensureTask(task: string, time: string | number | Date, data?: ScheduledTaskOptions): Promise<ScheduledTask | void> {
        const { tasks } = this.client.schedule;

        if (!tasks.some((s): boolean => s.taskName === task)) {
            this.client.emit('debug', `Creating task ${task}`);
            return this.client.schedule.create(task, time, data);
        }
    }
}