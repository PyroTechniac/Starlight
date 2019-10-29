import { Role } from 'discord.js';
import { Argument, KlasaGuild, KlasaMessage, Possible } from 'klasa';
import { FuzzySearch } from '../lib/util/FuzzySearch';
const ROLE_REGEXP = Argument.regex.role;

export default class extends Argument {

	public get role(): Argument {
		return this.store.get('role')!;
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: Role) => boolean): Promise<Role> {
		if (!arg) throw message.language.get('RESOLVER_NO_RESULTS', possible.name, 'role');
		if (!message.guild) return this.role.run(arg, possible, message);
		const resRole = this.resolveRole(arg, message.guild);
		if (resRole) return resRole;

		const result = await new FuzzySearch(message.guild.roles, (entry): string => entry.name, filter).run(message, arg, possible.min || undefined);
		if (result) return result[1];
		throw message.language.get('RESOLVER_NO_RESULTS', possible.name, 'role');
	}

	private resolveRole(query: string, guild: KlasaGuild): Role | null {
		if (ROLE_REGEXP.test(query)) return guild.roles.get(ROLE_REGEXP.exec(query)![1]) || null;
		return null;
	}

}
