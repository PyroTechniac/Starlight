import { Event, EventStore, KlasaMessage } from 'klasa';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            event: 'message'
        });
    }

    public run(message: KlasaMessage): void {
        if (this.client.ready) this.client.monitors.run(message);
    }
}