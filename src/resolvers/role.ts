import { Resolver } from '../lib/structures/Resolver';
import { Role, RoleStore } from 'discord.js';

const { role: ROLE_REGEXP } = Resolver.regex;

export default class extends Resolver {

	public run(arg: string, _, roles: RoleStore): Role | null {
		if (ROLE_REGEXP.test(arg)) return roles.get(ROLE_REGEXP.exec(arg)![1]) || null;
		return null;
	}

}
