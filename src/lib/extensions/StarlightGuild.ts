import { Guild, Structures } from 'discord.js';
import { KlasaGuild } from 'klasa';
import { StarlightGuildMemberStore } from '../structures/StarlightGuildMemberStore';

class StarlightGuild extends (Structures.get('Guild') as typeof KlasaGuild) {
    // @ts-ignore
    public members: StarlightGuildMemberStore = new StarlightGuildMemberStore(this);
}

// @ts-ignore
Structures.extend('Guild', (): typeof Guild => StarlightGuild);

export { StarlightGuild };
