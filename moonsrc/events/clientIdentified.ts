import { Collection } from 'discord.js';
import { Event, EventStore } from 'klasa';
import { NodeServerClient } from 'veza';

declare module 'klasa' {
    interface KlasaClient {
        clients: Collection<string, any>;
    }
}

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            event: 'client.identify',
            emitter: 'node'
        });
    }

    public async run(client: NodeServerClient): Promise<void> {
        this.client.emit('log', `${client.name} identified. Loading information into memory.`);
    }
}