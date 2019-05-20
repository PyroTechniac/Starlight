import { DMChannel, MessageAttachment, TextChannel } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

export default class FetchImageExtendable extends Extendable {
    public constructor(store: ExtendableStore, file: string[], directory: string) {
        super(store, file, directory, {
            appliesTo: [DMChannel, TextChannel]
        });
    }

    public async fetchImage(): Promise<MessageAttachment> {
        const messageBank = await (this as unknown as TextChannel | DMChannel).messages.fetch({ limit: 20 });

        for (const message of messageBank.values()) {
            const fetchedAttachment = message.attachments.first();
            if (fetchedAttachment && fetchedAttachment.height) return fetchedAttachment;
        }

        throw 'Couldn\'t find an image';
    }
}

declare module 'discord.js' {
    interface DMChannel {
        fetchImage(): Promise<MessageAttachment>;
    }

    interface TextChannel {
        fetchImage(): Promise<MessageAttachment>;
    }
}