import { Language, SchemaEntry, Serializer } from 'klasa';
import URL from 'url';

export default class extends Serializer {
    public async deserialize(data: any, entry: SchemaEntry, language: Language): Promise<any> {
        const url = URL.parse(data);
        if (url.protocol && url.hostname) return data;
        throw language.get('RESOLVER_INVALID_URL', entry.key);
    }
}