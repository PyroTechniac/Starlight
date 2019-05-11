import { Event, EventStore, Client } from 'klasa';
import { captureException } from 'raven';

export default class UnhandledRejectionEvent extends Event {
    public constructor(client: Client, store: EventStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            emitter: process
        });
    }

    public run(err: any): void {
        if (!err) return;
        this.client.emit('error', `Uncaught Promise Error: \n${err.stack || err}`);
        captureException(err);
    }
}