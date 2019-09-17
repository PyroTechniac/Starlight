import { Client, BufferResolvable } from 'discord.js';
import { Stream } from 'stream';
import fetch from 'node-fetch';
import { resolve } from 'path';
import * as fs from 'fs-nextra';
import { StarlightError } from './StarlightErrors';
import { once } from 'events';
import { isStream } from './util';

// @ts-ignore
const browser: boolean = typeof window !== 'undefined';

// A recreation of the d.js DataResolver

export class DataResolver {

	public readonly client!: Client;

	public ['constructor']: typeof DataResolver;

	public constructor(client: Client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	public resolveInviteCode(data: string): string {
		const match = this.constructor.inviteRegex.exec(data);
		if (match && match[1]) return match[1];
		return data;
	}

	public async resolveImage(image?: string | Buffer): Promise<string | null> {
		if (!image) return null;
		if (typeof image === 'string' && image.startsWith('data:')) {
			return image;
		}
		const file = await this.resolveFile(image);
		return this.resolveBase64(file);
	}

	public resolveBase64(data: Buffer | string): string {
		if (Buffer.isBuffer(data)) return `data:image/jpg;base64,${data.toString('base64')}`;
		return data;
	}

	public async resolveFile(resource: BufferResolvable | Stream): Promise<Buffer> {
		if (!browser && Buffer.isBuffer(resource)) return resource;
		if (browser && resource instanceof ArrayBuffer) return this.constructor.convertToBuffer(resource);

		if (typeof resource === 'string') {
			if (/^https?:\/\//.test(resource)) {
				return fetch(resource).then((res): Promise<Buffer> => browser ? res.blob() : res.buffer());
			} else if (!browser) {
				const file = browser ? resource : resolve(resource);
				const stats = await fs.stat(file);
				if (!stats || !stats.isFile()) throw new StarlightError('FILE_NOT_FOUND').init(file);
				return fs.readFile(file);
			}
		} else if (isStream(resource)) {
			const buffers: Buffer[] = [];

			resource.once('error', (err): never => {
				throw err;
			})
				.on('data', (data): number => buffers.push(data));
			await once(resource, 'end');
			return Buffer.concat(buffers);
		}

		throw new StarlightError('REQ_RESOURCE_TYPE').init();
	}

	private static inviteRegex: RegExp = /discord(?:app\.com\/invite|\.gg(?:\/invite)?)\/([\w-]{2,255})/i;

	private static convertToBuffer(ab: ArrayBuffer | string): Buffer {
		if (typeof ab === 'string') ab = this.str2ab(ab);
		return Buffer.from(ab);
	}

	private static str2ab(str: string): ArrayBuffer {
		const buffer = new ArrayBuffer(str.length * 2);
		const view = new Uint16Array(buffer);
		// eslint-disable-next-line no-var
		for (var i = 0, strLen = str.length; i < strLen; i++) view[i] = str.charCodeAt(i);
		return buffer;
	}

}
