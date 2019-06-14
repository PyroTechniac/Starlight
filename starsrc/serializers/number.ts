import { Language, SchemaEntry, Serializer, SerializerStore } from 'klasa';

export default class extends Serializer {
    public constructor(store: SerializerStore, file: string[], directory: string) {
        super(store, file, directory, { aliases: ['integer', 'float'] });
    }

    public async deserialize(data: any, entry: SchemaEntry, language: Language): Promise<number | null> {
        let num;
        switch(entry.type) {
            case 'integer':
                num = parseInt(data);
                // @ts-ignore
                if (Number.isInteger(num) && (this.constructor as typeof Serializer).minOrMax(num, entry, language)) return num;
                throw language.get('RESOLVER_INVALID_INT', entry.key);
            case 'number':
            case 'float':
                num = parseFloat(data);
                // @ts-ignore
                if (!isNaN(num) && (this.constructor as typeof Serializer).minOrMax(num, entry, language)) return num;
                throw language.get('RESOLVER_INVALID_FLOAT', entry.key);
        }
        return null;
    }
}