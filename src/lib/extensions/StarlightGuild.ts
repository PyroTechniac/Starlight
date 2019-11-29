import { Guild, Structures } from 'discord.js';
import { MemberNicknames } from '../util/cache/MemberNicknames';

export class StarlightGuild extends Structures.get('Guild') {

	public get nicknames(): MemberNicknames {
		return this.client.cache.acquireNicknames(this);
	}

}

Structures.extend('Guild', (): typeof Guild => StarlightGuild);
