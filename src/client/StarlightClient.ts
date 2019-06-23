import { CategoryChannel, Collection, DMChannel, NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';
import { Client, Gateway, KlasaClientOptions, KlasaUser, Schema, Settings } from 'klasa';
import { List } from '../lib';
import './StarlightPreload';

Client.defaultCategoryChannelSchema = new Schema();
Client.defaultTextChannelSchema = new Schema();
Client.defaultVoiceChannelSchema = new Schema();

declare module 'discord.js' {
    interface Client {
        readonly dms: Collection<string, DMChannel>;
        readonly voices: Collection<string, VoiceChannel>;
        readonly stores: Collection<string, StoreChannel>;
        readonly texts: Collection<string, TextChannel>;
        readonly news: Collection<string, NewsChannel>;
        readonly categories: Collection<string, CategoryChannel>;
    }

    interface CategoryChannel {
        settings: Settings;
    }

    interface TextChannel {
        fetchImage(limit: number): Promise<MessageAttachment | null>;
        settings: Settings;
    }

    interface VoiceChannel {
        settings: Settings;
    }

    interface DMChannel {
        fetchImage(limit: number): Promise<MessageAttachment | null>;
    }

    interface Message {
        unreact(emojiID: string): Promise<MessageReaction | null>;
        readonly settings: Settings;
    }
}

declare module 'klasa' {
    namespace Client {
        export let defaultTextChannelSchema: Schema;
        export let defaultVoiceChannelSchema: Schema;
        export let defaultCategoryChannelSchema: Schema;
    }
}

export class StarlightClient extends Client {
    public constructor(options?: KlasaClientOptions) {
        super(options);
        this
            .gateways
            .register(new Gateway(this, 'textChannels', { schema: Client.defaultTextChannelSchema }))
            .register(new Gateway(this, 'categoryChannels', { schema: Client.defaultCategoryChannelSchema }))
            .register(new Gateway(this, 'voiceChannels', { schema: Client.defaultVoiceChannelSchema }));
    }

    public get owners(): List<KlasaUser> {
        const oldSet = super.owners;
        const owners = new List([...oldSet.values()]);
        return owners;
    }

    public get dms(): Collection<string, DMChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'dm') as Collection<string, DMChannel>;
    }

    public get voices(): Collection<string, VoiceChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'voice') as Collection<string, VoiceChannel>;
    }

    public get texts(): Collection<string, TextChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'text') as Collection<string, TextChannel>;
    }

    public get news(): Collection<string, NewsChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'news') as Collection<string, NewsChannel>;
    }

    public get stores(): Collection<string, StoreChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'store') as Collection<string, StoreChannel>;
    }

    public get categories(): Collection<string, CategoryChannel> {
        return this.channels.filter((chan): boolean => chan.type === 'category') as Collection<string, CategoryChannel>;
    }
}