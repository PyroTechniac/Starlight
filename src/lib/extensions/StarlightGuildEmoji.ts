import { Structures, GuildEmoji } from 'discord.js';

class StarlightGuildEmoji extends Structures.get('GuildEmoji') {
}

Structures.extend('GuildEmoji', (): typeof GuildEmoji => StarlightGuildEmoji);

export { GuildEmoji };