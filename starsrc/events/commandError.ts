import { Event, KlasaMessage, Command } from 'klasa';

export default class extends Event {
    public run(message: KlasaMessage, command: Command, params: any[], error: Error | string): void {
        if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
        if ((error as Error).message) message.sendCode('JSON', (error as Error).message).catch((err): boolean => this.client.emit('wtf', err));
        else message.sendMessage(error).catch((err): boolean => this.client.emit('wtf', err));
    }
}