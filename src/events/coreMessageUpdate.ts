import { Event, EventStore, KlasaMessage } from 'klasa';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) { super(store, file, directory, { event: 'messageUpdate' }); }

    public async run(old: KlasaMessage, message: KlasaMessage): Promise<void> {
        if (this.client.ready && !old.partial && old.content !== message.content) this.client.monitors.run(message);
    }
}