import { Structures, Guild, Client } from 'discord.js'
import { MusicManager } from '../structures'

export default Structures.extend('Guild', (guild): typeof Guild => {
	return class extends guild {
		public music!: MusicManager
		public constructor(client: Client, data: object) {
			super(client, data)

			this.music = new MusicManager(this);
		}
	}
})

declare module 'klasa' {
	interface KlasaGuild {
		music!: MusicManager
	}
}