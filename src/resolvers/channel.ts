import { Resolver } from '../lib/structures/Resolver';
import { GuildChannel, GuildChannelStore } from 'discord.js';

const { channel: CHANNEL_REGEXP } = Resolver.regex;

export default class extends Resolver {

	public run(query: string, _, channels: GuildChannelStore): GuildChannel | null {
		if (CHANNEL_REGEXP.test(query)) return channels.get(CHANNEL_REGEXP.exec(query)![1]) || null;
		return null;
	}

}
