import { Guild } from 'discord.js';
import { Language, SchemaEntry, Serializer } from 'klasa';

export default class extends Serializer {
    public async deserialize(data: any, entry: SchemaEntry, language: Language): Promise<Guild> {
        if (data instanceof Guild) return data;
        const guild = (this.constructor as typeof Serializer).regex.channel.test(data) ? this.client.guilds.get(data) : null;
        if (guild) return guild;
        throw language.get('RESOLVER_INVALID_GUILD', entry.key);
    }

    public serialize(data: any): string {
        return data.id;
    }

    public stringify(data: any): string {
        return (this.client.guilds.get(data) || { name: data }).name;
    }
}