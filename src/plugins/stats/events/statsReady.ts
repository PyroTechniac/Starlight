import { Event, KlasaClient, EventStore } from 'klasa';

export default class StatsReadyEvent extends Event {
    public constructor(client: KlasaClient, store: EventStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            name: 'statsReady',
            once: true,
            event: 'klasaReady',
            emitter: client
        });
    }
    public run(): void {
        this.client.stats.registerAll();
    }
}