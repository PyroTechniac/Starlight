import { Argument, Possible, KlasaMessage } from 'klasa';
import { Util } from '../lib';
import { GuildChannel } from 'discord.js';


export default class extends Argument {
    public async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<GuildChannel> {
        if (!msg.guild) return this.channel.run(arg, possible, msg);
        const resChannel = Util.resolveChannel(arg, msg.guild);
        if (resChannel) return resChannel;

        const results: GuildChannel[] = [];
        const reg = Util.generateArgRegex(arg, false);
        for (const channel of msg.guild.channels.values()) {
            if (reg.test(channel.name)) results.push(channel);
        }

        let querySearch: GuildChannel[];
        if (results.length > 0) {
            const regWord = Util.generateArgRegex(arg, true);
            const filtered = results.filter((channel): boolean => regWord.test(channel.name));
            querySearch = filtered.length > 0 ? filtered : results;
        } else {
            querySearch = results;
        }

        switch(querySearch.length) {
            case 0: throw `${possible.name} Must be a valid name, id or channel mention.`;
            case 1: return querySearch[0];
            default: throw `Found multiple matches: \`${querySearch.map((channel): string => channel.name).join('`, `')}\``;
        }
    }

    public get channel(): Argument {
        return this.client.arguments.get('channel')!;
    }
}