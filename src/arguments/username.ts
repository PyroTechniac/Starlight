import { Argument, KlasaMessage, Possible } from 'klasa';
import { toss } from '../lib/util/Utils';
import { User } from 'discord.js';
import { FuzzySearch } from '../lib/util/FuzzySearch';

const { userOrMember: USER_REGEXP } = Argument.regex;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {

	private get user(): Argument {
		return this.store.get('user');
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: string) => boolean): Promise<User> {
		if (!arg) throw message.language.get('RESOLVER_INVALID_USERNAME', possible.name);
		if (!message.guild) return this.user.run(arg, possible, message);
		const resUser = await this.resolveUser(message, arg);
		if (resUser) return resUser;

		const result = await new FuzzySearch(message.guild.memberUsernames, (entry): string => entry, filter).run(message, arg, possible.min || undefined);
		if (result) {
			return this.client.users.fetch(result[0]).catch(() => toss(message.language.get('USER_NOT_EXISTENT')));
		}
		throw message.language.get('RESOLVER_INVALID_USERNAME', possible.name);
	}

	private resolveUser(message: KlasaMessage, query: string): Promise<User | null> {
		const id = USER_REGEXP.test(query)
			? USER_REGEXP.exec(query)![1]
			: USER_TAG.test(query)
				? this.client.usertags.findKey((tag): boolean => tag === query) || null
				: null;

		if (id) {
			return this.client.users.fetch(id).catch((): never => toss(message.language.get('USER_NOT_EXISTENT')));
		}
		return Promise.resolve(null);
	}

}
