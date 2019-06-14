import { Event, Command, KlasaMessage } from 'klasa';

export default class extends Event {
    public run(message: KlasaMessage, command: Command, params: any[], error: any): void {
        message.sendMessage(error).catch((err): boolean => this.client.emit('wtf', err));
    }
}