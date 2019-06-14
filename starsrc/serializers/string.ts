import { Language, SchemaEntry, Serializer } from 'klasa';

export default class extends Serializer {
    public async deserialize(data: any, entry: SchemaEntry, language: Language): Promise<string> {
        const str = String(data);
        // @ts-ignore
        return (this.constructor as typeof Serializer).minOrMax(str.length, entry, language) && str;
    }
}