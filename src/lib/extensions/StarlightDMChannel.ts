import { DMChannel, MessageAttachment, Structures } from 'discord.js';

class StarlightDMChannel extends Structures.get('DMChannel') {
    public async fetchImage(limit: number = 20): Promise<MessageAttachment | null> {
        const messageBank = await this.messages.fetch({ limit });

        for (const message of messageBank.values()) {
            const fetchedAttachment = message.attachments.first();
            if (fetchedAttachment && fetchedAttachment.height) return fetchedAttachment;
        }
        return null;
    }
}

Structures.extend('DMChannel', (): typeof DMChannel => StarlightDMChannel);
export { StarlightDMChannel };