import { Collection } from 'discord.js';
import { KlasaClient } from 'klasa';

export class Stats extends Collection<string, number> {
    public constructor(public readonly client: KlasaClient) {
        super();
    }

    public init(): this {
        for (const command of this.client.commands.values()) {
            this.set(command.name, 0);
        }
        return this;
    }

    public inc(key: string): void {
        let runCount = this.get(key);
        if (!runCount) throw new Error(`The command ${key} was not registered`);
        runCount++;
        this.set(key, runCount);
    }
}