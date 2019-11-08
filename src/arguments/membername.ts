import { Argument, KlasaMessage, Possible } from 'klasa';
import { GuildMember } from 'discord.js';
import { toss } from '../lib/util/Utils';
import { FuzzySearch } from '../lib/util/FuzzySearch';

const { userOrMember: MEMBER_REGEXP } = Argument.regex;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: string) => boolean): Promise<GuildMember> {
		if (!arg) throw message.language.get('RESOVLER_INVALID_USERNAME', possible.name);
		const resMember = await this.resolveMember(message, arg);
		if (resMember) return resMember;

		const result = await new FuzzySearch(message.guild!.memberUsernames, (entry): string => entry, filter).run(message, arg, possible.min || undefined);
		return result
			? message.guild!.members.fetch(result[0]).catch((): never => toss(message.language.get('USER_NOT_EXISTENT')))
			: toss(message.language.get('RESOLVER_INVALID_USERNAME', possible.name));
	}

	private resolveMember(message: KlasaMessage, query: string): Promise<GuildMember | null> {
		const id = MEMBER_REGEXP.test(query)
			? MEMBER_REGEXP.exec(query)![1]
			: USER_TAG.test(query)
				? this.client.usertags.findKey((tag): boolean => tag === query) || null
				: null;

		if (id) {
			return message.guild!.members.fetch(id).catch((): never => toss(message.language.get('USER_NOT_EXISTENT')));
		}
		return Promise.resolve(null);
	}

}
