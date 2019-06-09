import { Message, MessageReaction, Structures } from 'discord.js';


class StarlightMessage extends Structures.get('Message') {
    public async unreact(emojiID: string): Promise<MessageReaction | null> {
        const reaction = this.reactions.get(emojiID);
        return reaction ? reaction.users.remove(this.client.user!) : null;
    }
}

Structures.extend('Message', (): typeof Message => StarlightMessage);

export { StarlightMessage };
