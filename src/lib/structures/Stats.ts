import { Collection } from 'discord.js';
import { Command, KlasaClient } from 'klasa';

class Stat {
    private _count: number = 0;
    public readonly client: KlasaClient
    public constructor(public readonly stats: Stats) {
        this.client = stats.client;
    }

    public get count(): number {
        return this._count;
    }

    public inc(): number {
        this._count++;
        return this.count;
    }

    public dec(): number {
        this._count--;
        return this.count;
    }
}

export class Stats extends Collection<string, Stat> {
    public lastCommands: string[] = [];
    public constructor(public readonly client: KlasaClient) {
        super();
    }

    public init(): this {
        for (const command of this.client.commands.values()) {
            this.set(command.name, new Stat(this));
        }
        this.set('messages', new Stat(this));
        return this;
    }

    public pushCommand(cmd: Command): void {
        this.lastCommands.push(cmd.name);
        if (this.lastCommands.length > 10) this.lastCommands.shift();
    }

    public get total(): number {
        let total = 0;
        for (const [statType, statCount] of this.entries()) {
            if (statType === 'messages') continue;
            total += statCount.count;
        }
        return total;
    }

    public get messageCount(): number {
        return this.get('messages')!.count;
    }
}