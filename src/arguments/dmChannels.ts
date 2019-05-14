import { Argument, ArgumentStore, KlasaClient, MultiArgument } from 'klasa';

export default class MultiDMChannelArgument extends MultiArgument {
    public constructor(client: KlasaClient, store: ArgumentStore, file: string[], directory: string) {
        super(client, store, file, directory, { aliases: ['...dmChannel'] });
    }

    public get base(): Argument {
        return this.store.get('dmChannel');
    }
}