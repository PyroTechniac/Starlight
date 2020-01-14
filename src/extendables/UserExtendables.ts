import { Extendable } from '../lib/util/Decorators';
import { ImageSize, User } from 'discord.js';
import { UserSettings } from '../lib/settings/UserSettings';

export default class extends Extendable([User]) {

	public get profileLevel(this: User): number {
		return Math.floor(0.2 * Math.sqrt(this.settings.get(UserSettings.Points)));
	}

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
