import { Serializer, SerializerOptions, SerializerUpdateContext } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';

@ApplyOptions<SerializerOptions>({
	aliases: ['integer', 'float']
})
export default class extends Serializer {

	public deserialize(data: unknown): number {
		return Number(data);
	}

	public validate(data: unknown, { entry, language }: SerializerUpdateContext): number | null {
		let parsed: number;
		switch (entry.type) {
			case 'integer':
				parsed = Number.parseInt(data as string, 10);
				if (Number.isInteger(parsed) && Serializer.minOrMax(parsed, entry, language)) return parsed;
				throw language.get('RESOLVER_INVALID_INT', entry.key);
			case 'number':
			case 'float':
				parsed = Number.parseFloat(data as string);
				if (!isNaN(parsed) && Serializer.minOrMax(parsed, entry, language)) return parsed;
				throw language.get('RESOLVER_INVALID_FLOAT', entry.key);
		}
		return null;
	}

}
