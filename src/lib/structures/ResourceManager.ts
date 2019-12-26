import { Manager } from '../util/Manager';
import { resolve } from 'path';
import { readFile, stat } from 'fs-nextra';

export class ResourceManager extends Manager {

	public async resolveBuffer(resource: string | Buffer | NodeJS.ReadableStream): Promise<Buffer> {
		if (Buffer.isBuffer(resource)) return resource;

		if (typeof resource === 'string') {
			if (/^https?:\/\//.test(resource)) {
				return this.manager.network.cdn
					.url(resource)
					.type('Buffer')
					.get<Buffer>();
			}
			const file = resolve(resource);
			const stats = await stat(file);
			if (!stats || !stats.isFile()) throw new Error(`File could not be found: ${file}`);
			return readFile(file);

		}
		const data: Buffer[] = [];
		for await (const buffer of resource) data.push(this._resolveBuffer(buffer));
		return Buffer.concat(data);
	}

	private _resolveBuffer(buf: string | Buffer): Buffer {
		return Buffer.isBuffer(buf)
			? buf
			: Buffer.from(buf);
	}

}
