import { Language, SchemaEntry, Serializer, SerializerStore } from 'klasa';

export default class extends Serializer {
    public constructor(store: SerializerStore, file: string[], directory: string) {
        super(store, file, directory);

        this.aliases = [...this.client.pieceStores.keys()].map((type): string => type.slice(0, -1));
    }

    public async deserialize(data: any, entry: SchemaEntry, language: Language): Promise<any> {
        if (entry.type === 'piece') {
            for (const store of this.client.pieceStores.values()) {
                const pce = store.get(data);
                if (pce) return pce;
            }
            throw language.get('RESOLVER_INVALID_PIECE', entry.key, entry.type);
        }

        const store = this.client.pieceStores.get(`${entry.type}s`);
        if (!store) throw language.get('RESOLVER_INVALID_STORE', entry.key, entry.type);
        const parsed = typeof data === 'string' ? store.get(data) : data;
        if (parsed && parsed instanceof store.holds) return parsed;
        throw language.get('RESOLVER_INVALID_PIECE', entry.key, entry.type);
    }

    public serialize(data: any): string {
        return data.name;
    }
}