import { Message, MessageReaction, Structures } from 'discord.js';
import { KlasaMessage } from 'klasa';

class StarlightMessage extends (Structures.get('Message') as typeof KlasaMessage) {
    public async unreact(emojiID: string): Promise<MessageReaction | null> {
        const reaction = this.reactions.get(emojiID);
        return reaction ? reaction.users.remove(this.client.user!) : null;
    }
}

Structures.extend('Message', (): typeof Message => StarlightMessage);

export { StarlightMessage };