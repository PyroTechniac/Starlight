import { Event, EventStore, KlasaMessage } from 'klasa';
import { Collection } from 'discord.js';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            event: 'messageDeleteBulk'
        });
    }

    public run(messages: Collection<string, KlasaMessage>): void {
        for (const message of messages.values()) {
            if (message.command && message.command.deletable) {
                for (const msg of message.responses) {
                    msg.delete();
                }
            }
        }
    }
}