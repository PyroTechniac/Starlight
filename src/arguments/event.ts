import { Argument, Possible, KlasaMessage, Event } from 'klasa';

export default class EventArgument extends Argument {
    public run(arg: string, possible: Possible, message: KlasaMessage): Event {
        const event = this.client.events.get(arg);
        if (event) return event;
        throw message.language.get('RESOLVER_INVALID_PIECE', possible.name, 'event');
    }
}