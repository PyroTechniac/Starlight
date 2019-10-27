import { GuildChannel } from 'discord.js';
import { Argument, Possible, KlasaMessage, KlasaGuild } from 'klasa';
import { FuzzySearch } from '../lib/util/FuzzySearch';

const CHANNEL_REGEX = Argument.regex.channel;

export default class extends Argument {

	public get channel(): Argument {
		return this.store.get('channel')!;
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: GuildChannel) => boolean): Promise<GuildChannel> {
		if (!arg) throw message.language.get('RESOLVER_NO_RESULTS', possible.name, 'channel');
		if (!message.guild) return this.channel.run(arg, possible, message);
		const resChannel = this.resolveChannel(arg, message.guild);
		if (resChannel) return resChannel;

		const results = await new FuzzySearch(message.guild.channels, (entry): string => entry.name, filter).run(message, arg, possible.min || undefined);
		if (results) return results[1];

		throw message.language.get('RESOLVER_NO_RESULTS', possible.name, 'channel');
	}

	private resolveChannel(query: string, guild: KlasaGuild): GuildChannel | null {
		if (CHANNEL_REGEX.test(query)) return guild.channels.get(CHANNEL_REGEX.exec(query)![1]) || null;
		return null;
	}

}
