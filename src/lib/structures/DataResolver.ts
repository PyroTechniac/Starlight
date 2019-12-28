import { Readable } from 'stream';
import { Manager } from '../util/Manager';
import { resolve } from 'path';
import { readFile, stat } from 'fs-nextra';
import { BufferReadable } from '../util/BufferReadable';

export class DataResolver extends Manager {

	public async resolveBuffer(resource: Buffer | string | Readable): Promise<Buffer> {
		if (Buffer.isBuffer(resource)) return resource;

		if (typeof resource === 'string') {
			if (/^https?:\/\//.test(resource)) {
				return this.manager.cdn
					.url(resource)
					.type('Buffer')
					.get<Buffer>();
			}
			const file = resolve(resource);
			const stats = await stat(file);

			if (!stats.isFile()) throw new Error(`File could not be found: ${file}`);
			return readFile(file);

		}

		return this.streamToBuffer(resource);
	}

	public bufferToStream(buffer: Buffer): Promise<BufferReadable> {
		return Promise.resolve(new BufferReadable(buffer));
	}

	public async streamToBuffer(stream: Readable): Promise<Buffer> {
		const data: Buffer[] = [];
		for await (const buffer of stream) data.push(buffer as Buffer);
		return Buffer.concat(data);
	}

	public async downloadStream(stream: Readable): Promise<Readable> {
		return this.bufferToStream(await this.streamToBuffer(stream));
	}

}
