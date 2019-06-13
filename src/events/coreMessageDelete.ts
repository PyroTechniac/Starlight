import { Event, EventStore, KlasaMessage } from 'klasa';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            event: 'messageDelete'
        });
    }

    public run(message: KlasaMessage): void {
        if (message.command && message.command.deletable) {
            for (const msg of message.responses) {
                msg.delete();
            }
        }
    }
}