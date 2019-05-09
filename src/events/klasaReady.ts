import { Event, EventStore, KlasaClient } from 'klasa';

export default class KlasaReadyEvent extends Event {
    public constructor(client: KlasaClient, store: EventStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            once: true,
            event: 'klasaReady'
        });
    }

    public async run(): Promise<void> {
        this.ensureTask('cleanup', '*/10 * * * *');
        this.ensureTask('jsonBackup', '@weekly');
        await this.client.user!.setPresence({
            activity: {
                type: 'PLAYING',
                name: 'Starlight, help'
            }
        });
    }

    private ensureTask(task: string, time: string | number | Date): void {
        const { tasks } = this.client.schedule;

        if (!tasks.some((s): boolean => s.taskName === task)) {
            this.client.schedule.create(task, time);
        }
    }
}