import { Event, EventStore, ScheduledTaskOptions } from 'klasa';
import { DefaultPresence } from '../util';
import { Stats } from '../lib';

export default class KlasaReadyEvent extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            once: true,
            event: 'klasaReady'
        });
    }

    private get stats(): Stats {
        return this.client.stats;
    }

    public async run(): Promise<void> {
        this.stats.init();
        this.ensureTask('cleanup', '*/10 * * * *');
        this.ensureTask('jsonBackup', '@weekly');
        this.ensureTask('setPresence', '@hourly', { data: DefaultPresence });
        await this.client.user!.setPresence(DefaultPresence);
    }

    private ensureTask(task: string, time: string | number | Date, data?: ScheduledTaskOptions | undefined): void {
        const { tasks } = this.client.schedule;

        if (!tasks.some((s): boolean => s.taskName === task)) {
            this.client.schedule.create(task, time, data);
        }
    }
}