import { TextChannel, MessageAttachment, Structures } from 'discord.js';

class StarlightTextChannel extends Structures.get('TextChannel') {
    public async fetchImage(limit: number = 20): Promise<MessageAttachment | null> {
        const messageBank = await this.messages.fetch({ limit });

        for (const message of messageBank.values()) {
            const fetchedAttachment = message.attachments.first();
            if (fetchedAttachment && fetchedAttachment.height) return fetchedAttachment;
        }
        return null;
    }
}

Structures.extend('TextChannel', (): typeof TextChannel => StarlightTextChannel);

export { StarlightTextChannel }