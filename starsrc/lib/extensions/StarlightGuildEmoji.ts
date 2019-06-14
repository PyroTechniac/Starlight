import { GuildEmoji, Structures } from 'discord.js';

class StarlightGuildEmoji extends Structures.get('GuildEmoji') {
}

Structures.extend('GuildEmoji', (): typeof GuildEmoji => StarlightGuildEmoji);

export { GuildEmoji };
