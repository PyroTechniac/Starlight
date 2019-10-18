import { Client, Guild } from 'discord.js';
import { BanInfo } from '../types/Interfaces';
import { List } from './List';

export class BanStore extends List<BanInfo> {

	public guild: Guild;
	public constructor(guild: Guild) {
		super();

		this.guild = guild;
	}

	public get client(): Client {
		return this.guild.client;
	}

	public async fetch(): Promise<this> {
		const coll = await this.guild.fetchBans();
		for (const [user, { reason }] of coll) {
			this.add({
				user,
				reason
			});
		}

		return this;
	}

}
