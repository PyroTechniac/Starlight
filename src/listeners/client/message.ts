import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MessageListener extends Listener {
    public constructor() {
        super('messageCounter', {
            emitter: 'client',
            event: 'message',
            category: 'client'
        });
    }

    public async exec(msg: Message) {
        if (msg.author.bot) return;
        this.client.config.messages.inc();
    }
}
