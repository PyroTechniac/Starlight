import { KlasaUser, Language, SchemaEntry, Serializer } from 'klasa';

export default class extends Serializer {
    public async deserialize(data: any, entry: SchemaEntry, language: Language): Promise<KlasaUser> {
        let user: KlasaUser | null = this.client.users.resolve(data);
        if (user) return user;
        if ((this.constructor as typeof Serializer).regex.userOrMember.test(data)) user = await this.client.users.fetch((this.constructor as typeof Serializer).regex.userOrMember.exec(data)![1]).catch((): null => null);
        if (user) return user;
        throw language.get('RESOLVER_INVALID_USER', entry.key);
    }

    public serialize(value: KlasaUser): string {
        return value.id;
    }

    public stringify(value: any): string {
        return (this.client.users.get(value) || { username: (value && value.username) || value }).username;
    }
}