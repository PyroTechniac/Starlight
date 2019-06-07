import { Serializer, SchemaEntry, Language } from 'klasa';

export default class extends Serializer {
    public async deserialize(data: any, piece: SchemaEntry, language: Language): Promise<BigInt> {
        if (data instanceof BigInt) return data;
        try {
            return BigInt(data);
        } catch (e) {
            throw language.get('RESOLVER_INVALID_INT', piece.key);
        }
    }

    public serialize(data: BigInt): string {
        return data.toString();
    }
}