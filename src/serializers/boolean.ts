import { Language, SchemaEntry, Serializer, SerializerStore } from 'klasa';
const truths: string[] = ['1', 'true', '+', 't', 'yes', 'y'];
const falses: string[] = ['0', 'false', '-', 'f', 'no', 'n'];

export default class extends Serializer {
    public constructor(store: SerializerStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['bool']
        });
    }

    public async deserialize(data: any, entry: SchemaEntry, language: Language): Promise<boolean> {
        const bool = String(data).toLowerCase();
        if (truths.includes(bool)) return true;
        if (falses.includes(bool)) return false;
        throw language.get('RESOLVER_INVALID_BOOL');
    }

    public stringify(data: any): string {
        return data ? 'Enabled' : 'Disabled';
    }
}