import { Argument, KlasaMessage, Possible } from 'klasa';
import { toss } from '../lib/util/Utils';
import { User } from 'discord.js';
import { FuzzySearch } from '../lib/util/FuzzySearch';

export default class extends Argument {

	private get user(): Argument {
		return this.store.get('user')!;
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: string) => boolean): Promise<User> {
		if (!arg) throw message.language.get('RESOLVER_INVALID_USERNAME', possible.name);
		if (!message.guild) return this.user.run(arg, possible, message);

		const resUser = await this.client.resolver.user(arg);
		if (resUser) return resUser;

		const result = await new FuzzySearch(message.guild.memberTags.mapUsernames(), (entry): string => entry, filter).run(message, arg, possible.min || undefined);
		return result
			? this.client.users.fetch(result[0]).catch((): never => toss(message.language.get('USER_NOT_EXISTENT')))
			: toss(message.language.get('RESOLVER_INVALID_USERNAME', possible.name));
	}

}
