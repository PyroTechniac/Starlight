import { Event, EventStore } from 'klasa';
import { Node } from 'veza';

declare module 'klasa' {
    interface KlasaClient {
        node: Node;
    }
}


export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, { once: true });
    }

    public async run(): Promise<void> {
        await this.client.node.serve(6969);
    }
}