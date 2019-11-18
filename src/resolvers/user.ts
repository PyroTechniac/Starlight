import { Resolver } from '../lib/structures/Resolver';
import { Language } from 'klasa';
import { toss } from '../lib/util/Utils';
import { User, UserStore } from 'discord.js';

const { userOrMember: USER_REGEXP } = Resolver.regex;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Resolver {

	public run(arg: string, language: Language, coll: UserStore): Promise<User | null> {
		const id = USER_REGEXP.test(arg)
			? USER_REGEXP.exec(arg)![1]
			: USER_TAG.test(arg)
				? this.client.userCache.resolve(arg, true)
				: null;

		return id
			? coll.fetch(id).catch((): never => toss(language.get('USER_NOT_EXISTENT')))
			: Promise.resolve(null);
	}

}
