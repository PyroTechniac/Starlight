import { Argument, Possible, KlasaMessage, Duration } from 'klasa';

export default class DurationArgument extends Argument {
    public run(arg: string, possible: Possible, message: KlasaMessage): Date {
        const date = new Duration(arg).fromNow;
        if (!Number.isNaN(date.getTime()) && date.getTime() > Date.now()) return date;
        throw message.language.get('RESOLVER_INVALID_DURATION', possible.name);
    }
}