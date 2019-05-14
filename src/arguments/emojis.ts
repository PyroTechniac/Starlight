import { MultiArgument, Argument, KlasaClient, ArgumentStore } from 'klasa';

export default class MultiEmojiArgument extends MultiArgument {
    public constructor(client: KlasaClient, store: ArgumentStore, file: string[], directory: string) {
        super(client, store, file, directory, { aliases: ['...emoji'] });
    }

    public get base(): Argument {
        return this.store.get('emoji');
    }
}