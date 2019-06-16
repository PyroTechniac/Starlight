import { Settings } from 'klasa';
import { MessageAttachment, Structures, TextChannel } from 'discord.js';

class StarlightTextChannel extends Structures.get('TextChannel') {
    public settings: Settings = this.client.gateways.get(`${this.type}Channels`)!.acquire(this);

    public async fetchImage(limit: number = 20): Promise<MessageAttachment | null> {
        const messageBank = await this.messages.fetch({ limit });

        for (const message of messageBank.values()) {
            const fetchedAttachment = message.attachments.first();
            if (fetchedAttachment && fetchedAttachment.height) return fetchedAttachment;
        }

        return null;
    }

    public toJSON(): object {
        return { ...super.toJSON(), settings: this.settings.toJSON() };
    }
}

Structures.extend('TextChannel', (): typeof TextChannel => StarlightTextChannel);
export { StarlightTextChannel };