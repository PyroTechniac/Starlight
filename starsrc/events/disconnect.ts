import { Event, EventStore } from 'klasa';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, { event: 'shardDisconnected' });
    }

    public run(err: CloseEvent): void {
        this.client.emit('error', `Disconnected | ${err.code}: ${err.reason}`);
    }
}