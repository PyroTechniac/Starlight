import { Role } from 'discord.js';
import { KlasaGuild, KlasaMessage, Language, SchemaEntry, Serializer } from 'klasa';

export default class extends Serializer {
    public async deserialize(data: any, entry: SchemaEntry, language: Language, guild: KlasaGuild): Promise<Role> {
        if (!guild) throw this.client.languages.default.get('RESOLVER_INVALID_GUILD', entry.key);
        if (data instanceof Role) return data;
        const role = (this.constructor as typeof Serializer).regex.role.test(data) ? guild.roles.get((this.constructor as typeof Serializer).regex.role.exec(data)![1]) : guild.roles.find((role): boolean => role.name === data) || null;
        if (role) return role;
        throw language.get('RESOLVER_INVALID_ROLE', entry.key);
    }

    public serialize(value: Role): string {
        return value.id;
    }

    // @ts-ignore
    public stringify(data: any, message: KlasaMessage): string {
        return (message.guild!.roles.get(data) || { name: (data && data.name) || data }).name;
    }
}