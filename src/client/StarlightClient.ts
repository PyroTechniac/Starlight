import { CategoryChannel, Collection, DMChannel, NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';
import { Client, Gateway, KlasaClientOptions, KlasaUser, Schema, Settings } from 'klasa';
import { ClientUtil, List } from '../lib/util';
import { ObjectStore } from '../lib/structures/ObjectStore';
import './StarlightPreload';

Client.defaultCategoryChannelSchema = new Schema();
Client.defaultTextChannelSchema = new Schema();
Client.defaultVoiceChannelSchema = new Schema();
Client.defaultMemberSchema = new Schema();

declare module 'discord.js' {
    interface Client {
        util: ClientUtil;
        readonly dms: Collection<string, DMChannel>;
        readonly voices: Collection<string, VoiceChannel>;
        readonly stores: Collection<string, StoreChannel>;
        readonly texts: Collection<string, TextChannel>;
        readonly news: Collection<string, NewsChannel>;
        readonly categories: Collection<string, CategoryChannel>;
    }

    interface GuildChannel {
        settings: Settings;
    }

    interface Message {
        unreact(emojiID: string): Promise<MessageReaction | null>;
    }
}

declare module 'klasa' {
    namespace Client { // eslint-disable-line
        export let defaultTextChannelSchema: Schema;
        export let defaultVoiceChannelSchema: Schema;
        export let defaultCategoryChannelSchema: Schema;
        export let defaultMemberSchema: Schema;
    }
}

export class StarlightClient extends Client {
    public objects: ObjectStore;
    public constructor(options: KlasaClientOptions) {
        super(options);
        this.util = new ClientUtil(this);

        this.objects = new ObjectStore(this);
        this.registerStore(this.objects);

        this.gateways.register(new Gateway(this, 'categoryChannels', { schema: (this.constructor as typeof Client).defaultCategoryChannelSchema }))
            .register(new Gateway(this, 'textChannels', { schema: (this.constructor as typeof Client).defaultTextChannelSchema }))
            .register(new Gateway(this, 'voiceChannels', { schema: (this.constructor as typeof Client).defaultVoiceChannelSchema }))
            .register(new Gateway(this, 'members', { schema: (this.constructor as typeof Client).defaultMemberSchema }));
    }
    public get owners(): List<KlasaUser> {
        const owners = new List<KlasaUser>();
        for (const owner of this.options.owners) {
            const user = this.users.get(owner);
            if (user) owners.add(user);
        }
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