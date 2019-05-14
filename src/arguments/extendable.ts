import { Argument, Extendable, KlasaMessage, Possible } from 'klasa';

export default class ExtendableArgument extends Argument {
    public run(arg: string, possible: Possible, message: KlasaMessage): Extendable {
        const extendable = this.client.extendables.get(arg);
        if (extendable) return extendable;
        throw message.language.get('RESOLVER_INVALID_PIECE', possible.name, 'extendable');
    }
}