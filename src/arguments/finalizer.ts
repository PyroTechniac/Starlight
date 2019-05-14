import { Finalizer, Argument, Possible, KlasaMessage } from 'klasa';

export default class FinalizerArgument extends Argument {
    public run(arg: string, possible: Possible, message: KlasaMessage): Finalizer {
        const finalizer = this.client.finalizers.get(arg);
        if (finalizer) return finalizer;
        throw message.language.get('RESOLVER_INVALID_PIECE', possible.name, 'finalizer');
    }
}