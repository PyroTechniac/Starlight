import { Event, Command, KlasaMessage } from 'klasa';

export default class extends Event {
    public run(message: KlasaMessage, command: Command, response: string[] | null): void {
        if (response && response.length) message.sendMessage(response);
    }
}