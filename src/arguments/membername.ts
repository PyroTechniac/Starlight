import { Guild, GuildMember, User } from 'discord.js';
import { Argument, KlasaMessage, Possible, util } from 'klasa';

const { regExpEsc } = util;
const { userOrMember: USER_REGEXP } = Argument.regex;

function resolveMember(query, guild: Guild): GuildMember | Promise<GuildMember | null> | null {
    if (query instanceof GuildMember) return query;
    if (query instanceof User) return guild.members.fetch(query.id);
    if (typeof query === 'string') {
        if (USER_REGEXP.test(query)) return guild.members.fetch(USER_REGEXP.exec(query)![1]).catch((): null => null);
        if (/\w{1,32}#\d{4}/.test(query)) {
            const res = guild.members.find((member): boolean => member.user.tag.toLowerCase() === query.toLowerCase());
            return res || null;
        }
    }

    return null;
}

export default class extends Argument {
    public async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<GuildMember> {
        if (!msg.guild) throw 'This command can only be used inside a guild.';
        const resUser = await resolveMember(arg, msg.guild);
        if (resUser) return resUser;

        const results: GuildMember[] = [];
        const reg = new RegExp(regExpEsc(arg), 'i');
        for (const member of msg.guild.members.values()) {
            if (reg.test(member.user.username)) results.push(member);
        }

        let querySearch: GuildMember[];
        if (results.length > 0) {
            const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
            const filtered = results.filter((member): boolean => regWord.test(member.user.username));
            querySearch = filtered.length > 0 ? filtered : results;
        } else {
            querySearch = results;
        }

        switch(querySearch.length) {
            case 0: throw `${possible.name} Must be a valid name, ID, or user mention.`;
            case 1: return querySearch[0];
            default: throw `Found multiple matches: \`${querySearch.map<string>((member): string => member.user.tag).join('`, `')}\``;
        }
    }
}