import { Argument, KlasaMessage, Possible } from 'klasa';
import { GuildChannel } from 'discord.js';
import { FuzzySearch } from '../lib/util/FuzzySearch';
import { checkChannel, toss } from '../lib/util/Utils';

export default class extends Argument {

	private get channel(): Argument {
		return this.store.get('channel')!;
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: GuildChannel) => boolean): Promise<GuildChannel> {
		if (!arg) throw message.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
		if (!message.guild) return this.channel.run(arg, possible, message);
		const resChannel = await this.client.resolver.channel(arg);
		if (resChannel && checkChannel(resChannel, 'guild')) return resChannel;

		const result = await new FuzzySearch(message.guild.channels, (entry): string => entry.name, filter).run(message, arg, possible.min || undefined);
		return result ? result[1] : toss(message.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name));
	}

}
