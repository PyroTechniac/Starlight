import { Argument, Possible, KlasaMessage } from 'klasa';
import { GuildEmoji } from 'discord.js';

export default class EmojiArgument extends Argument {
    public run(arg: string, possible: Possible, message: KlasaMessage): GuildEmoji {
        const emoji = (this.constructor as typeof Argument).regex.emoji.test(arg) ? this.client.emojis.get((this.constructor as typeof Argument).regex.emoji.exec(arg)![1]) : null;
        if (emoji) return emoji;
        throw message.language.get('RESOLVER_INVALID_EMOJI', possible.name);
    }
}