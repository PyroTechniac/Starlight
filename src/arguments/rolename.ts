import { Message, Role } from 'discord.js';
import { Argument, KlasaGuild, Possible } from 'klasa';
import { makeArgRegex } from '../lib';

const { role: ROLE_REGEXP } = Argument.regex;

function resolveRole(query: Role | string, guild: KlasaGuild): Role | null {
	if (query instanceof Role) return guild.roles.has(query.id) ? query : null;
	if (typeof query === 'string' && ROLE_REGEXP.test(query)) return guild.roles.get(ROLE_REGEXP.exec(query)![1]) || null;
	return null;
}

export default class extends Argument {

	public async run(arg: string, possible: Possible, msg: Message): Promise<Role> {
		if (!msg.guild) return this.store.get('role').run(arg, possible, msg);
		const resRole = resolveRole(arg, msg.guild);
		if (resRole) return resRole;

		const results: Role[] = [];
		const reg = makeArgRegex(arg);
		for (const role of msg.guild.roles.values()) {
			if (reg.test(role.name)) results.push(role);
		}

		let querySearch: Role[];
		if (results.length > 0) {
			const regWord = makeArgRegex(arg, true);
			const filtered = results.filter((role): boolean => regWord.test(role.name));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw `${possible.name} Must be a valid name, ID or role mention.`;
			case 1: return querySearch[0];
			default:
				if (querySearch[0].name.toLowerCase() === arg.toLowerCase()) return querySearch[0];
				throw `Found multiple matches: \`${querySearch.map((r): string => r.name).join('`, `')}\``;
		}
	}

}
