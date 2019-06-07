import { Client, KlasaClientOptions, KlasaUser } from 'klasa';
import { ClientUtil, List } from '../lib/util';
import { Collection, DMChannel,  VoiceChannel, StoreChannel, NewsChannel, TextChannel, CategoryChannel } from 'discord.js';

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
}

export class StarlightClient extends Client {
    public constructor(options: KlasaClientOptions) {
        super(options);
        this.util = new ClientUtil(this);
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