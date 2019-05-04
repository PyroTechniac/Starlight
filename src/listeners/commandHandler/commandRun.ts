import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
export class CommandListener extends Listener {
    public constructor() {
        super('commandCounter', {
            event: 'commandFinished',
            emitter: 'commandHandler',
            category: 'commandHandler'
        });
    }

    public exec(msg: Message) {
        if (msg.author.bot) return;
        this.client.config.commands.inc();
    }
}
