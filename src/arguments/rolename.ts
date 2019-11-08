import { Argument, KlasaGuild, KlasaMessage, Possible } from 'klasa';
import { Role } from 'discord.js';
import { FuzzySearch } from '../lib/util/FuzzySearch';
import { toss } from '../lib/util/Utils';
const { role: ROLE_REGEXP } = Argument.regex;

export default class extends Argument {

	private get role(): Argument {
		return this.store.get('role')!;
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: Role) => boolean): Promise<Role> {
		if (!arg) throw message.language.get('RESOLVER_INVALID_ROLENAME', possible.name);
		if (!message.guild) return this.role.run(arg, possible, message);
		const resRole = this.resolveRole(arg, message.guild);
		if (resRole) return resRole;

		const result = await new FuzzySearch(message.guild.roles, (entry): string => entry.name, filter).run(message, arg, possible.min || undefined);
		return result ? result[1] : toss(message.language.get('RESOLVER_INVALID_ROLENAME', possible.name));
	}

	private resolveRole(query: string, guild: KlasaGuild): Role | null {
		if (ROLE_REGEXP.test(query)) return guild.roles.get(ROLE_REGEXP.exec(query)![1]) || null;
		return null;
	}

}
