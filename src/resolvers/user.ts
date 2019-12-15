import { Resolver } from '../lib/structures/Resolver';
import { User } from 'discord.js';
import { toss } from '../lib/util/Utils';

const { userOrMember: USER_REGEXP } = Resolver.regex;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Resolver<User> {

	public run({ arg, language }): Promise<User | null> {
		const id = USER_REGEXP.test(arg)
			? USER_REGEXP.exec(arg)![1]
			: USER_TAG.test(arg)
				? this.client.userCache.resolve(arg, true)
				: null;

		return id
			? this.client.users.fetch(id).catch((): never => toss(language.get('USER_NOT_EXISTENT')))
			: Promise.resolve(null);
	}

}
