import { Argument, Possible, KlasaMessage } from 'klasa';
import { Channel, Message, Guild, GuildChannel } from 'discord.js';
import { makeArgRegex } from '../lib/util/Utils';

const { channel: CHANNEL_REGEXP } = Argument.regex;

function resolveChannel(query: string | Channel | Message, guild: Guild): GuildChannel | null {
	if (query instanceof Channel) return guild.channels.has(query.id) ? guild.channels.get(query.id)! : null;
	if (query instanceof Message) return query.guild!.id === guild.id ? guild.channels.get(query.channel.id) || null : null;
	if (typeof query === 'string' && CHANNEL_REGEXP.test(query)) return guild.channels.get(CHANNEL_REGEXP.exec(query)![1]) || null;
	return null;
}

export default class extends Argument {

	private get channel(): Argument {
		return this.store.get('channel');
	}

	public run(arg: string, possible: Possible, msg: KlasaMessage): Promise<GuildChannel> {
		if (!msg.guild) return this.channel.run(arg, possible, msg);
		const resChannel = resolveChannel(arg, msg.guild);
		if (resChannel) return Promise.resolve(resChannel);

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
			case 0: throw msg.language.get('RESOLVER_NO_RESULTS', possible.name, 'channel');
			case 1: return Promise.resolve(querySearch[0]);
			default: throw msg.language.get('RESOLVER_MULTIPLE_RESULTS', querySearch.map((chan): string => chan.name).join('`, `'));
		}
	}

}
