import { Serializer, SerializerStore, Client } from 'klasa'
const truths = ['1', 'true', '+', 't', 'yes', 'y'];
const falses = ['0', 'false', '-', 'f', 'no', 'n'];

export default class BooleanSerializer extends Serializer {
	public constructor(client: Client, store: SerializerStore, file: string[], directory: string) {
		super(client, store, file, directory, { aliases: ['bool'] })
	}

	// @ts-ignore
	public deserialize(data, piece, language): boolean {
		const boolean = String(data).toLowerCase();
		if (truths.includes(boolean)) return true;
		if (falses.includes(boolean)) return false;
		throw language.get('RESOLVER_INVALID_BOOL', piece.key);

	}

	public stringify(value: boolean): string {
		return value ? 'Enabled' : 'Disabled'
	}
}