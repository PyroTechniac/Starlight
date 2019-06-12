import { Channel, Guild, GuildChannel, Message } from 'discord.js';
import { Argument, KlasaMessage, Possible, util } from 'klasa';

const { regExpEsc } = util;
const { channel: CHANNEL_REGEXP } = Argument.regex;

function resolveChannel(query: GuildChannel | Message | string, guild: Guild): GuildChannel | null {
    if (query instanceof Channel) return guild.channels.has(query.id) ? query : null;
    if (query instanceof Message) return query.guild!.id === guild.id ? query.channel as GuildChannel : null;
    if (typeof query === 'string' && CHANNEL_REGEXP.test(query)) return guild.channels.get(CHANNEL_REGEXP.exec(query)![1]) || null;
    return null;
}

export default class extends Argument {
    public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<GuildChannel | null> {
        if (!message.guild) return this.channel.run(arg, possible, message);
        const resChannel = resolveChannel(arg, message.guild!);
        if (resChannel) return resChannel;

        const results: GuildChannel[] = [];
        const reg = new RegExp(regExpEsc(arg), 'i');
        for (const channel of message.guild.channels.values()) {
            if (reg.test(channel.name)) results.push(channel);
        }

        let querySearch: GuildChannel[];
        if (results.length > 0) {
            const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
            const filtered = results.filter((chan): boolean => regWord.test(chan.name));
            querySearch = filtered.length > 0 ? filtered : results;
        } else {
            querySearch = results;
        }

        switch (querySearch.length) {
            case 0: throw `${possible.name} Must be a valid name, ID, or channel mention`;
            case 1: return querySearch[0];
            default: throw `Found multiple matches: \`${querySearch.map((chan): string => chan.name).join('`, `')}\``;
        }
    }

    private get channel(): Argument {
        return this.store.get('channel')!;
    }
}