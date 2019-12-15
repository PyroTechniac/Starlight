import { Resolver, ResolverContext } from '../lib/structures/Resolver';
import { Role } from 'discord.js';

export default class extends Resolver<Role> {

	public run(context: ResolverContext): Promise<Role | null> {
		if (!context.guild) return Promise.resolve(null);
		return Resolver.regex.role.test(context.arg)
			? context.guild.roles.fetch(Resolver.regex.role.exec(context.arg)![1])
			: Promise.resolve(null);
	}

}
