import { Guild, Structures } from 'discord.js';
import { MemberNicknames } from '../util/cache/MemberNicknames';

export class StarlightGuild extends Structures.get('Guild') {

	public readonly nicknames = new MemberNicknames(this);

}

Structures.extend('Guild', (): typeof Guild => StarlightGuild);
