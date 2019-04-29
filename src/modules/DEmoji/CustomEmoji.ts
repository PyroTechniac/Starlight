import { AkairoClient } from 'discord-akairo';
import { MessageAttachment } from 'discord.js';

export interface RawEmojiData {
    id: number;
    title: string;
    slug: string;
    image: string;
    description: string;
    category: number;
    license: string;
    source?: string;
    faves: number;
    submitted_by: string;
    width: number;
    height: number;
    filesize: number;
}

export class CustomEmoji {
    public id: number;
    public title: string;
    public slug: string;
    public image: MessageAttachment;
    private url: string;
    public category: number;
    public license: string;
    public faves: number;
    public constructor(public readonly client: AkairoClient, data: RawEmojiData) {
        this.id = data.id;
        this.title = data.title;
        this.slug = data.slug;
        this.url = data.image;
        this.image = new MessageAttachment(this.url);
        this.category = data.category;
        this.license = data.license;
    }
}
