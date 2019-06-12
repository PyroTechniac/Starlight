import { Structures, Guild } from 'discord.js';
import { StarlightGuildMemberStore } from '../structures/StarlightGuildMemberStore';

class StarlightGuild extends (Structures.get('Guild') as typeof Guild) {
    // @ts-ignore
    public members: StarlightGuildMemberStore = new StarlightGuildMemberStore(this);
}

// @ts-ignore
Structures.extend('Guild', (): typeof Guild => StarlightGuild);

export { StarlightGuild };