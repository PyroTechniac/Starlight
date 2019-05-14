import { Argument, ArgumentStore, KlasaClient, MultiArgument } from 'klasa';

export default class MultiEventArgument extends MultiArgument {
    public constructor(client: KlasaClient, store: ArgumentStore, file: string[], directory: string) {
        super(client, store, file, directory, { aliases: ['...event'] });
    }

    public get base(): Argument {
        return this.store.get('event');
    }
}