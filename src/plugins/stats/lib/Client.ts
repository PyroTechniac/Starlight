import { Client, KlasaClientOptions } from 'klasa';
import { join } from 'path';
import { StatsStore } from './structures/StatsStore';

export class StatsClient extends Client {
    public constructor(options?: KlasaClientOptions) {
        super(options);
        // @ts-ignore
        this.constructor[Client.plugin].call(this);
    }

    public static [Client.plugin](this: StatsClient): void {
        const coreDirectory = join(__dirname, '..', '/');

        this.stats = new StatsStore(this);

        // @ts-ignore
        this.finalizers.registerCoreDirectory(coreDirectory);
        // @ts-ignore
        this.events.registerCoreDirectory(coreDirectory);
    }
}

declare module 'discord.js' {
    interface Client {
        stats: StatsStore;
    }
}