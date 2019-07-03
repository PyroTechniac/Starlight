import { GuildMember } from 'discord.js';
import { Argument, KlasaMessage, Possible, util } from 'klasa';
import { Util } from '../lib';
const { regExpEsc } = util;

export default class extends Argument {
    public async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<GuildMember> {
        if (!msg.guild) throw 'This command can only be used inside a guild.';
        const resUser = await Util.resolveMember(arg, msg.guild);
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
            case 0: throw `${possible.name} Must be a valid name, id, or user mention`;
            case 1: return querySearch[0];
            default: throw `Found multiple matches: \`${querySearch.map((member): string => member.user.tag).join('`, `')}\``;
        }
    }
}