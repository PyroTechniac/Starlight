import { KlasaMessage, Possible, Argument, ArgumentStore, Client } from 'klasa';
const truths = ['1', 'true', '+', 't', 'yes', 'y'];
const falses = ['0', 'false', '-', 'f', 'no', 'n'];

export default class BooleanArgument extends Argument {
    public constructor(client, store, file, directory) {
        super(client, store, file, directory, { aliases: ['bool'] });
    }

    public run(arg: string, possible: Possible, message: KlasaMessage): boolean {
        const bool = String(arg).toLowerCase();
        if (truths.includes(bool)) return true;
        if (falses.includes(bool)) return false;
        throw message.language.get('RESOLVER_INVALID_BOOL', possible.name);
    }
}