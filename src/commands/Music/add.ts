import { CommandStore, KlasaClient } from 'klasa'
import { MusicCommand } from '../../lib'
import fetch from 'node-fetch'
import { stringify } from 'querystring'

const URL = 'https://www.googleapis.com/youtube/v3/search?';

export default class AddCommand extends MusicCommand {
	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: 'Adds a song to the queue',
			usage: '<url:string>'
		})
	}

	private async getURL(url: string): string {
		const id = MusicCommand.YOUTUBE_REGEX.exec(url);
		if (id) return `https://youtu.be/${id![1]}`;

		const query = stringify({
			part: 'snippet',
			q: url,
			key: this.client.config.google
		})
		const { items } = await fetch(URL + query)
			.then((result): any => result.json())
	}
}