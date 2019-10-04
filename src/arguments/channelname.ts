import { makeArgRegex } from '../lib/util/Utils';
import { Channel, GuildChannel, Message } from 'discord.js';
import { Argument, KlasaGuild, Possible } from 'klasa';

const { channel: CHANNEL_REGEXP } = Argument.regex;

function resolveChannel(query: Channel | Message | string, guild: KlasaGuild): null | GuildChannel {
	if (query instanceof Channel) return guild.channels.has(query.id) ? guild.channels.get(query.id) || null : null;
	if (query instanceof Message) return query.guild!.id === guild.id ? guild.channels.get(query.channel.id) || null : null;
	if (typeof query === 'string' && CHANNEL_REGEXP.test(query)) return guild.channels.get(CHANNEL_REGEXP.exec(query)![1]) || null;
	return null;
}

export default class extends Argument {

	public async run(arg: string, possible: Possible, msg: Message): Promise<GuildChannel> {
		if (!msg.guild) return this.store.get('channel').run(arg, possible, msg);
		const resChannel = resolveChannel(arg, msg.guild);
		if (resChannel) return resChannel;

		const results: GuildChannel[] = [];
		const reg = makeArgRegex(arg);
		for (const channel of msg.guild.channels.values()) {
			if (reg.test(channel.name)) results.push(channel);
		}

		let querySearch: GuildChannel[];
		if (results.length > 0) {
			const regWord = makeArgRegex(arg, true);
			const filtered = results.filter((channel): boolean => regWord.test(channel.name));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw msg.language.get<string, [string, string]>('RESOLVER_INVALID_NAME', possible.name, 'channel');
			case 1: return querySearch[0];
			default: throw msg.language.get<string, [string]>('RESOLVER_INVALID_MULTIPLE_ITEMS', querySearch.map((channel): string => channel.name).join('`, `'));
		}
	}

}
