import { Argument, KlasaMessage, Possible } from 'klasa';

export default class BaseArgument extends Argument {
    public run(arg: string, possible: Possible, message: KlasaMessage): Argument {
        const argument = this.client.arguments.get(arg);
        if (argument) return argument;
        throw message.language.get('RESOLVER_INVALID_PIECE', possible.name, 'argument');
    }
}