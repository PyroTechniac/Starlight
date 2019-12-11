import { Structures, ImageSize, User } from 'discord.js';

export class StarlightUser extends Structures.get('User') {

	public async fetchAvatar(size: ImageSize = 512): Promise<Buffer> {
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

Structures.extend('User', (): typeof User => StarlightUser);
