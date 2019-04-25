import { Command, Listener } from 'discord-akairo';
import { Message } from 'discord.js';

/* eslint-disable promise/no-promise-in-callback */

export default class CommandErrorListener extends Listener {
    public constructor() {
        super('commandError', {
            emitter: 'commandHandler',
            event: 'error',
            category: 'commandHandler'
        });
    }

    public exec(error: Error | string, message: Message, command: Command): Promise<Message | Message[]> | void {
        if (error instanceof Error) this.client.emit('error', `[COMMAND] ${command.id}\n${error.stack || error}`);
        if ((error as Error).message) message.util.send((error as Error).message, { code: 'JSON' }).catch(err => this.client.emit('error', err));
        else message.util.send(error).catch(err => this.client.emit('error', err));
    }
}
