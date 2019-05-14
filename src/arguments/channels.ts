import { MultiArgument, Argument, Client, ArgumentStore } from 'klasa';

export default class MultiChannelArgument extends MultiArgument {
    public constructor(client: Client, store: ArgumentStore, file: string[], directory: string) {
        super(client, store, file, directory, { aliases: ['...channel'] });
    }

    public get base(): Argument {
        return this.store.get('channel')!;
    }
}