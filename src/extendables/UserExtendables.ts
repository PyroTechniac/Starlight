import { Extendable } from '../lib/util/Decorators';
import { ImageSize, User } from 'discord.js';

export default class extends Extendable([User]) {

	public async fetchAvatar(this: User, size: ImageSize = 512): Promise<Buffer> {
		const url = this.displayAvatarURL({ format: 'png', size });
		try {
			return await this.client.cdn
				.url(url)
				.type('Buffer')
				.get<Buffer>();
		} catch (e) {
			throw `Could not download the profile avatar: ${e}`;
		}
	}

}
