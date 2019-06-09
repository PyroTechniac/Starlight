import { Event, EventStore, KlasaMessage, Stopwatch } from 'klasa';
import TagCommand from '../commands/General/tag';

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            event: 'commandUnknown'
        });
    }

    public async run(message: KlasaMessage, command: string): Promise<void> {
        const tagCommand = this.client.commands.get('tag') as TagCommand;
        const timer = new Stopwatch();
        if (this.client.options.typing) message.channel.startTyping();
        try {
            await this.client.inhibitors.run(message, tagCommand);
            try {
                const commandRun = tagCommand.show(message, [command]);
                timer.stop();
                const response = await commandRun as KlasaMessage | KlasaMessage[];
                this.client.finalizers.run(message, tagCommand, response, timer);
                this.client.emit('commandSuccess', message, tagCommand, ['show', command], response);
            } catch (err) {
                this.client.emit('commandError', message, tagCommand, ['show', command], err);
            }
        } catch (response) {
            this.client.emit('commandInhibited', message, tagCommand, response);
        }

        if (this.client.options.typing) message.channel.stopTyping();
    }
}