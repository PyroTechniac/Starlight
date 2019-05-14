import { Argument, Possible, KlasaMessage } from 'klasa';

export default class CustomArgument extends Argument {
    // @ts-ignore
    public async run(arg: string, possible: Possible, message: KlasaMessage, custom: any): Promise<any> {
        try {
            const resolved = await custom(arg, possible, message, message.params);
            return resolved;
        } catch (err) {
            if (err) throw err;
            throw message.language.get('RESOLVER_INVALID_CUSTOM', possible.name, possible.type);
        }
    }
}