import { Collection } from 'discord.js';
import { Command, KlasaClient } from 'klasa';

export class Stats extends Collection<string, number> {
    public lastCommands: string[] = [];
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
        if (!runCount && runCount !== 0) throw new Error(`The command ${key} was not registered`);
        runCount++;
        this.set(key, runCount);
    }

    public pushCommand(cmd: Command): void {
        this.lastCommands.push(cmd.name);
        if (this.lastCommands.length > 10) this.lastCommands.shift();
    }
}