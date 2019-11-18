import { Resolver, ResolverOptions } from '../lib/structures/Resolver';
import { GuildMember, GuildMemberStore } from 'discord.js';
import { ApplyOptions } from '../lib/util/Decorators';
import { toss } from '../lib/util/Utils';
import { Language } from 'klasa';

const { userOrMember: USER_REGEXP } = Resolver.regex;
const USER_TAG = /^\w{1,32}#\d{4}$/;

@ApplyOptions<ResolverOptions>({
	aliases: ['guildmember']
})
export default class extends Resolver {

	public run(query: string, language: Language, members: GuildMemberStore): Promise<GuildMember | null> {
		const id = USER_REGEXP.test(query)
			? USER_REGEXP.exec(query)![1]
			: USER_TAG.test(query)
				? this.client.userCache.resolve(query, true)
				: null;

		return id
			? members.fetch(id).catch(() => toss(language.get('USER_NOT_EXISTENT')))
			: Promise.resolve(null);
	}

}
