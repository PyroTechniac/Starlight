import { Resolver, ResolverContext, ResolverOptions } from '../lib/structures/Resolver';
import { ApplyOptions } from '../lib/util/Decorators';
import { GuildMember } from 'discord.js';
import { toss } from '../lib/util/Utils';

const USER_TAG = /^\w{1,32}#\d{4}$/;
const { userOrMember: USER_REGEXP } = Resolver.regex;

@ApplyOptions<ResolverOptions>({
	aliases: ['guildmember']
})
export default class extends Resolver<GuildMember> {

	public run({ arg, guild, language }: ResolverContext): Promise<null | GuildMember> {
		if (!guild) return Promise.resolve(null);

		const id = USER_REGEXP.test(arg)
			? USER_REGEXP.exec(arg)![1]
			: USER_TAG.test(arg)
				? this.client.userCache.resolve(arg, true)
				: null;

		return id
			? guild.members.fetch(id).catch((): never => toss(language.get('USER_NOT_EXISTENT')))
			: Promise.resolve(null);
	}

}
