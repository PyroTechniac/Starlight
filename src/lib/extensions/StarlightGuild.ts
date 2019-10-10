import { Structures } from 'discord.js';
import { ModerationManager } from '../structures/ModerationManager';
import { BanStore } from '../structures/BanStore';

export class StarlightGuild extends Structures.get('Guild') {

	public moderation: ModerationManager = new ModerationManager(this);

	public get bans(): BanStore {
		return this.moderation.bans;
	}

}
