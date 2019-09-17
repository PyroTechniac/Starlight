import { Language, SchemaEntry, Serializer } from 'klasa';

/* global BigInt: false */

export default class extends Serializer {

	public async deserialize(data: unknown, piece: SchemaEntry, language: Language): Promise<BigInt> {
		if (data instanceof BigInt) return data;
		try {
			return BigInt(data);
		} catch (err) {
			throw language.get('RESOLVER_INVALID_INT', piece.key);
		}
	}

}
