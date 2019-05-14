import { parse } from 'url';
import { Argument, KlasaClient, ArgumentStore, KlasaMessage, Possible } from 'klasa';

export default class HyperLinkArgument extends Argument {
    public constructor(client: KlasaClient, store: ArgumentStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['url']
        });
    }

    public run(arg: string, possible: Possible, message: KlasaMessage): string {
        const res = parse(arg);
        const hyperlink = res.protocol && res.hostname ? arg : null;
        if (hyperlink !== null) return hyperlink;
        throw message.language.get('RESOLVER_INVALID_URL', possible.name);
    }
}