import { Language, SchemaPiece, Serializer } from 'klasa';

export default class BigintSerializer extends Serializer {
    public deserialize(data: any, piece: SchemaPiece, language: Language): Promise<BigInt> {
        if (data instanceof BigInt) return data as unknown as Promise<any>;
        try {
            return BigInt(data) as unknown as Promise<any>;
        } catch (err) {
            throw language.get('RESOLVER_INVALID_INT', piece.key);
        }
    }

    public serialize(data: BigInt): string {
        return data.toString();
    }
}