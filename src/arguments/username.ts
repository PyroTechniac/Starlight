import { makeArgRegex, noop } from '../lib/util/Utils';
import { Guild, GuildMember, Message, User } from 'discord.js';
import { Argument, Possible } from 'klasa';

const { userOrMember: USER_REGEXP } = Argument.regex;

function resolveUser(query: string | User | GuildMember, guild: Guild): Promise<User | null> {
	if (query instanceof GuildMember) return Promise.resolve(query.user);
	if (query instanceof User) return Promise.resolve(query);
	if (typeof query === 'string') {
		if (USER_REGEXP.test(query)) return guild.client.users.fetch(USER_REGEXP.exec(query)![1]).catch(noop);
		if (/\w{1,32}#\d{4}/.test(query)) {
			const res = guild.members.find((member: GuildMember): boolean => member.user.tag === query);
			return res ? Promise.resolve(res.user) : Promise.resolve(null);
		}
	}
	return Promise.resolve(null);
}

export default class extends Argument {

	public async run(arg: string, possible: Possible, msg: Message): Promise<User> {
		if (!msg.guild) return this.store.get('user').run(arg, possible, msg)!;
		const resUser = await resolveUser(arg, msg.guild);
		if (resUser) return resUser;

		const results: User[] = [];
		const reg = makeArgRegex(arg);
		for (const member of msg.guild.members.values()) {
			if (reg.test(member.user.username)) results.push(member.user);
		}

		let querySearch: User[];
		if (results.length > 0) {
			const regWord = makeArgRegex(arg, true);
			const filtered = results.filter((user): boolean => regWord.test(user.username));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw msg.language.get<string, [string, string]>('RESOLVER_INVALID_NAME', possible.name, 'user');
			case 1: return querySearch[0];
			default: throw msg.language.get<string, [string]>('RESOLVER_INVALID_MULTIPLE_ITEMS', querySearch.map((u): string => u.tag).join('`. `'));
		}
	}

}
