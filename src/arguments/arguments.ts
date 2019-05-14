import { Argument, ArgumentStore, KlasaClient, MultiArgument } from 'klasa';

export default class BaseMultiArgument extends MultiArgument {
    public constructor(client: KlasaClient, store: ArgumentStore, file: string[], directory: string) {
        super(client, store, file, directory, { aliases: ['...argument'] });
    }

    public get base(): Argument {
        return this.store.get('Argument');
    }
}