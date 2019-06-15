import { Event, EventStore } from 'klasa';
import { Node } from 'veza';
import { Constants } from '../lib/util';

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
        await this.client.user!.setPresence(Constants.DefaultPresenceData);
        await this.client.node.serve(6969);
    }
}