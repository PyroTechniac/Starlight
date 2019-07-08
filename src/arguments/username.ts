import { Argument, util as klasaUtil, Possible, KlasaMessage, KlasaUser } from 'klasa';
import { Util } from '../lib';
const { regExpEsc } = klasaUtil;
const { resolveUser } = Util;

export default class extends Argument {
    public async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<KlasaUser> {
        if (!msg.guild) return this.store.get('user').run(arg, possible, msg);
        
        const resUser = await resolveUser(arg, msg.guild);
        if (resUser) return resUser;

        const results: KlasaUser[] = [];
        const reg = Util.generateArgRegex(arg);
        for (const member of msg.guild.members.values()) {
            if (reg.test(member.user.username)) results.push(member.user);
        }

        let querySearch: KlasaUser[];
        if (results.length > 0 ) {
            const regWord = Util.generateArgRegex(arg, true);
            const filtered = results.filter((user): boolean => regWord.test(user.username));
            querySearch = filtered.length > 0 ? filtered : results;
        } else {
            querySearch = results;
        }

        switch(querySearch.length) {
            case 0: throw `${possible.name} Must be a valid username, id or user mention.`;
            case 1: return querySearch[0];
            default: throw `Found multiple matches: \`${querySearch.map((user): string => user.tag).join('`, `')}\``;
        }
    }
}