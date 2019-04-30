import { AkairoClient } from 'discord-akairo';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { CustomEmojiStore } from './CustomEmojiStore';
import { DefaultEmbedColor } from '../../util/Constants';

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
    public category: string;
    public license: string;
    public faves: number;
    public constructor(public readonly client: AkairoClient, private store: CustomEmojiStore, data: RawEmojiData) {
        this.id = data.id;
        this.title = data.title;
        this.slug = data.slug;
        this.url = data.image;
        this.image = new MessageAttachment(this.url);
        this.category = this.store.categories.get(`${data.category}`);
        this.license = data.license;
    }

    public get embed(): MessageEmbed {
        return this.client.util.embed()
            .setColor(DefaultEmbedColor)
            .setTitle(this.title)
            .setThumbnail(this.url);
    }
}
