import { Serializer, SerializerOptions, SerializerUpdateContext, Type } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { Readable } from 'stream';
import { ReadableBuffer } from '../lib/util/ReadableBuffer';

@ApplyOptions<SerializerOptions>({
	aliases: ['stream']
})
export default class extends Serializer {

	public deserialize(raw: string, { entry }: SerializerUpdateContext): Buffer | Readable {
		const data = Buffer.from(raw, 'base64');
		switch (entry.type) {
			case 'buffer':
				return data;
			case 'stream':
				return new ReadableBuffer(data);
			default:
				throw new Error(`Invalid type ${entry.type}`);
		}
	}

	public async validate(raw: string | Buffer | Readable): Promise<string> {
		const resolved = await this.client.resolver.buffer(raw);
		if (!resolved) throw new Error(`Could not resolve buffer from source ${new Type(raw)}`);
		return resolved.toString('base64');
	}

}
