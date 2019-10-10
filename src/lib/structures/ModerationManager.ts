import { Guild, Client } from 'discord.js';
import { BanStore } from './BanStore';

export class ModerationManager {

	public guild: Guild;

	public bans: BanStore = new BanStore(this);

	public constructor(guild: Guild) {
		this.guild = guild;
	}

	public get client(): Client {
		return this.guild.client;
	}

}
