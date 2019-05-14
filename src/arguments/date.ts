import { Argument, Possible, KlasaMessage } from 'klasa';

export default class DateArgument extends Argument {
    public run(arg: string, possible: Possible, message: KlasaMessage): Date {
        const date = new Date(arg);
        if (!Number.isNaN(date.getTime()) && date.getTime() > Date.now()) return date;
        throw message.language.get('RESOLVER_INVALID_DATE', possible.name);
    }
}