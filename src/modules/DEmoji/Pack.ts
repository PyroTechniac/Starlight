import { AkairoClient } from 'discord-akairo';
import { MessageAttachment } from 'discord.js';
import { CustomEmojiStore } from './CustomEmojiStore';

export interface RawPackData {
    id: number;
    name: string;
    description: string;
    slug: string;
    image: string;
    download: string;
    amount: number;
}

export class Pack {
    public id: number;
    public name: string;
    public description: string;
    public slug: string;
    private url: string;
    public image: MessageAttachment
    public download: string;
    public amount: number;
    public constructor(public readonly client: AkairoClient, private store: CustomEmojiStore, data: RawPackData) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.slug = data.slug;
        this.url = data.image;
        this.image = new MessageAttachment(this.url);
        this.download = data.download;
        this.amount = data.amount;
    }
}
