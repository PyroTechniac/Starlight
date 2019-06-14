import { Channel, GuildChannel } from 'discord.js';
import { KlasaGuild, KlasaMessage, Language, SchemaEntry, Serializer, SerializerStore } from 'klasa';

export default class extends Serializer {
    public constructor(store: SerializerStore, file, directory) {
        super(store, file, directory, { aliases: ['textchannel', 'voicechannel', 'categorychannel'] });
    }

    private checkChannel(data: Channel, entry: SchemaEntry, language: Language): GuildChannel {
        if (
            entry.type === 'channel' ||
            (entry.type === 'textchannel' && data.type === 'text') ||
            (entry.type === 'voicechannel' && data.type === 'voice') ||
            (entry.type === 'categorychannel' && data.type === 'category')
        ) return data as GuildChannel;
        throw language.get('RESOLVER_INVALID_CHANNEL');
    }

    public async deserialize(data: any, entry: SchemaEntry, language: Language, guild: KlasaGuild): Promise<GuildChannel> {
        if (data instanceof Channel) return this.checkChannel(data, entry, language);
        const channel = (this.constructor as typeof Serializer).regex.channel.test(data) ? (guild || this.client).channels.get((this.constructor as typeof Serializer).regex.channel.exec(data)![1]) : null;
        if (channel) return this.checkChannel(channel, entry, language);
        throw language.get('RESOLVER_INVALID_CHANNEL', entry.key);
    }

    public serialize(data: Channel): string {
        return data.id;
    }

    // @ts-ignore
    public stringify(data: any, message: KlasaMessage): string {
        return (message.guild!.channels.get(data) || { name: (data && data.name) || data }).name;
    }
}