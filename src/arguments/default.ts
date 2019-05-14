import { Argument, Possible, KlasaMessage } from 'klasa';

export default class DefaultArgument extends Argument {
    public run(arg: string, possible: Possible, message: KlasaMessage): string {
        const literal = possible.name.toLowerCase();
        // @ts-ignore
        if (typeof arg === 'undefined' || arg.toLowerCase() !== literal) message.args.splice(message.params.length, 0, undefined);
        return literal;
    }
}