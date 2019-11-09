import { Argument, KlasaMessage, Possible } from 'klasa';
import { Role } from 'discord.js';
import { FuzzySearch } from '../lib/util/FuzzySearch';
import { toss } from '../lib/util/Utils';


export default class extends Argument {

	private get role(): Argument {
		return this.store.get('role')!;
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: Role) => boolean): Promise<Role> {
		if (!arg) throw message.language.get('RESOLVER_INVALID_ROLENAME', possible.name);
		if (!message.guild) return this.role.run(arg, possible, message);
		const resRole = await this.client.resolvers.run('role', arg, message.language, message.guild.roles);
		if (resRole) return resRole;

		const result = await new FuzzySearch(message.guild.roles, (entry): string => entry.name, filter).run(message, arg, possible.min || undefined);
		return result ? result[1] : toss(message.language.get('RESOLVER_INVALID_ROLENAME', possible.name));
	}

}
