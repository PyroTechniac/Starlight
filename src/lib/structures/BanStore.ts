import { List } from './List';
import { BanInfo } from '../types/Interfaces';
import { ModerationManager } from './ModerationManager';
import { Guild, Client } from 'discord.js';

export class BanStore extends List<BanInfo> {

	public manager: ModerationManager;
	public constructor(manager: ModerationManager) {
		super();

		this.manager = manager;
	}

	public get guild(): Guild {
		return this.manager.guild;
	}

	public get client(): Client {
		return this.manager.client;
	}

	public async fetch(): Promise<this> {
		const coll = await this.guild.fetchBans();
		for (const info of coll.values()) {
			this.add({
				user: info.user.id,
				reason: info.reason
			});
		}

		return this;
	}

}
