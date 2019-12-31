import { Serializer, SerializerOptions, SerializerUpdateContext } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { Readable } from 'stream';
import { resolve } from 'path';
import { readFile, stat } from 'fs-nextra';
import { streamToIterator } from '../lib/util/Utils';
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
		const resolved = await this.resolveBuffer(raw);
		return resolved.toString('base64');
	}

	private async resolveBuffer(resource: string | Buffer | Readable): Promise<Buffer> {
		if (Buffer.isBuffer(resource)) return resource;

		if (typeof resource === 'string') {
			if (/^https?:\/\//.test(resource)) {
				return this.client.cdn
					.type('Buffer')
					.url(resource)
					.get<Buffer>();
			}
			const file = resolve(resource);
			const stats = await stat(file);
			if (!stats.isFile()) throw new Error(`File could not be found: ${file}`);
			return readFile(file);

		}

		const data: Buffer[] = [];
		for await (const buf of streamToIterator(resource)) data.push(buf);
		return Buffer.concat(data);
	}

}
