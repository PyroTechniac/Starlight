import { Serializer, SerializerOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { Readable } from 'stream';

@ApplyOptions<SerializerOptions>({
	aliases: ['stream']
})
export default class extends Serializer {

	public deserialize(data: string): Buffer {
		return Buffer.from(data, 'base64');
	}

	public async validate(data: Readable | Buffer | string) {
		const buf = await this.client.manager.resolver.resolveBuffer(data);

		return buf.toString('base64');
	}

}
