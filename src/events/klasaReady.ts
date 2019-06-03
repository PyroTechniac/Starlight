import { Event, EventStore, ScheduledTaskOptions } from 'klasa';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            once: true
        });
    }

    public async run(): Promise<void> {
        await this.ensureTask('cleanup', '*/8 0 0 0 0');
    }

    private async ensureTask(name: string, time: string | number | Date, data?: ScheduledTaskOptions): Promise<void> {
        const { tasks } = this.client.schedule;
        if (!tasks.some((task): boolean => task.taskName === name)) {
            await this.client.schedule.create(name, time, data);
            this.client.emit('debug', `Creating event ${name}`);
        }
    }
}