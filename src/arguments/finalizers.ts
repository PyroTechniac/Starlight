import { Argument, ArgumentStore, KlasaClient, MultiArgument } from 'klasa';

export default class MultiFinalizerArgument extends MultiArgument {
    public constructor(client: KlasaClient, store: ArgumentStore, file: string[], directory: string) {
        super(client, store, file, directory, { aliases: ['...finalizer'] });
    }

    public get base(): Argument {
        return this.store.get('finalizer');
    }
}