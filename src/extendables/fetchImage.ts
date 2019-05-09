import { Extendable } from 'klasa';
import { DMChannel, TextChannel, MessageAttachment } from 'discord.js';
import { KlasaClient } from 'klasa';
import { ExtendableStore } from 'klasa';

export default class FetchImageExtendable extends Extendable {
    public constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            appliesTo: [DMChannel, TextChannel]
        });
    }

    public async fetchImage(): Promise<MessageAttachment> {
        const messageBank = await (this as unknown as TextChannel | DMChannel).messages.fetch({limit: 20});

        for (const message of messageBank.values()) {
            const fetchedAttachment = message.attachments.first();
            if (fetchedAttachment && fetchedAttachment.height) return fetchedAttachment;
        }

        throw 'Couldn\'t find an image';
    }
}