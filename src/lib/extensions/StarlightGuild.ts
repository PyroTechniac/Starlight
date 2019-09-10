import { Structures, Guild } from 'discord.js';
import { ModManager } from '../structures/ModManager';

class StarlightGuild extends Structures.get('Guild') {

	public moderation: ModManager = new ModManager(this);

}

Structures.extend('Guild', (): typeof Guild => StarlightGuild);
export { StarlightGuild };
