import { Structures, MessageAttachment, TextChannel } from 'discord.js';

declare module 'discord.js' {
    interface TextChannel {
        fetchImage(limit: number): Promise<MessageAttachment | null>;
    }
}

class StarlightTextChannel extends Structures.get('TextChannel') {
    public async fetchImage(limit = 20): Promise<MessageAttachment | null> {
        const messageBank = await this.messages.fetch({ limit });

        for (const message of messageBank.values()) {
            const fetchedAttachment = message.attachments.first();
            if (fetchedAttachment && fetchedAttachment.height) return fetchedAttachment;
        }

        return null;
    }
}

Structures.extend('TextChannel', (): typeof TextChannel => StarlightTextChannel);

export { StarlightTextChannel };