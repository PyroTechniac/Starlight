import { Collection } from 'discord.js';
import { Event, EventStore } from 'klasa';
import { NodeServerClient, Node } from 'veza';
import { Constants } from '../lib/util'

declare module 'klasa' {
    interface KlasaClient {
        clients: Collection<string, any>;
        node: Node;
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

        this.client.node.sendTo(`${client.name}`, { op: Constants.OPCODES.HELLO });
    }
}