import { Client, Collection, Guild } from 'discord.js';
import { MusicInterface } from './MusicInterface';

export class MusicManager extends Collection<string, MusicInterface> {
    public constructor(public client: Client) {
        super();
    }

    public add(guild: Guild): MusicInterface {
        if (!(guild instanceof Guild)) throw 'Expected a Guild instance';
        if (this.has(guild.id)) return this.get(guild.id)!;
        const mi = new MusicInterface(guild);
        this.set(guild.id, mi);
        return mi;
    }
}