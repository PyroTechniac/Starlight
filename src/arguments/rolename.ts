import { Argument, util as klasaUtil, Possible, KlasaMessage } from 'klasa';
import { Util } from '../lib';
import { Role } from 'discord.js';
const { resolveRole } = Util;

export default class extends Argument {
    public async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<Role> {
        if (!msg.guild) throw 'This command can only be used inside a guild.';
        const resRole = await resolveRole(arg, msg.guild);
        if (resRole) return resRole;

        const results: Role[] = [];
        const reg = Util.generateArgRegex(arg);
        for (const role of msg.guild.roles.values()) { if (reg.test(role.name)) results.push(role); }

        let querySearch: Role[];
        if (results.length > 0) {
            const regWord = Util.generateArgRegex(arg, true);
            const filtered = results.filter((role): boolean => regWord.test(role.name));
            querySearch = filtered.length > 0 ? filtered : results;
        } else {
            querySearch = results;
        }

        switch (querySearch.length) {
            case 0: throw `${possible.name} Must be a valid name, id or role mention`;
            case 1: return querySearch[0];
            default:
                if (querySearch[0].name.toLowerCase() === arg.toLowerCase()) return querySearch[0];
                throw `Found multiple matches: \`${querySearch.map((role): string => role.name).join('`, `')}\``;
        }
    }
}