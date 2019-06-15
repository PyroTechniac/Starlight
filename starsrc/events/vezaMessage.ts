import { Event, EventStore } from 'klasa';
import { NodeMessage } from 'veza';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            emitter: 'node',
            event: 'message'
        });
    }

    public async run(message: NodeMessage): Promise<void> {
        this.client.console.log(`${message}`, message, message.data);
    }
}