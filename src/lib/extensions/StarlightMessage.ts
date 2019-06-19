import { Message, MessageReaction, Structures } from 'discord.js';
import { KlasaMessage, Settings } from 'klasa';

class StarlightMessage extends (Structures.get('Message') as typeof KlasaMessage) {
    public async unreact(emojiID: string): Promise<MessageReaction | null> {
        const reaction = this.reactions.get(emojiID);
        return reaction ? reaction.users.remove(this.client.user!) : null;
    }

    public get settings(): Settings {
        return this.channel.type === 'text' ? this.guild!.settings : this.author!.settings;
    }
}

Structures.extend('Message', (): typeof Message => StarlightMessage);

export { StarlightMessage };
