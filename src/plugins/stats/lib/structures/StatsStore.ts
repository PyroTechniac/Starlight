import { Stats } from './Stats';
import { Collection } from 'discord.js';
import { KlasaClient } from 'klasa';

export class StatsStore extends Collection<string, Stats> {
    public readonly client!: KlasaClient
    public constructor(client: KlasaClient) {
        super();

        Object.defineProperty(this, 'client', { value: client });
    }

    public registerAll(): void {
        this.set('commands', new Stats());

        for (const command of this.client.commands.values()) {
            this.get('commands')!.add(command.name);
        }
    }
}