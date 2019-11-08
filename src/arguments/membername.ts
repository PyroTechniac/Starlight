import { Argument, KlasaMessage, Possible } from 'klasa';
import { GuildMember } from 'discord.js';
import { toss } from '../lib/util/Utils';
import { FuzzySearch } from '../lib/util/FuzzySearch';

export default class extends Argument {

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: string) => boolean): Promise<GuildMember> {
		if (!arg) throw message.language.get('RESOVLER_INVALID_USERNAME', possible.name);
		const resMember = await this.client.resolvers.run('guildmember', arg, message.language, message.guild!.members);
		if (resMember) return resMember;
		const result = await new FuzzySearch(message.guild!.memberUsernames, (entry): string => entry, filter).run(message, arg, possible.min || undefined);
		return result
			? message.guild!.members.fetch(result[0]).catch((): never => toss(message.language.get('USER_NOT_EXISTENT')))
			: toss(message.language.get('RESOLVER_INVALID_USERNAME', possible.name));
	}

}
