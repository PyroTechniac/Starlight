import { Serializer, KlasaGuild, SchemaEntry, Language } from 'klasa';
import { GuildMember } from 'discord.js';
import { noop, toss } from '../lib/util/Utils';

export default class extends Serializer {

	public async deserialize(data: any, entry: SchemaEntry, language: Language, guild: KlasaGuild): Promise<GuildMember> {
		if (!guild) throw language.get('RESOLVER_INVALID_GUILD', entry.key);
		if (data instanceof GuildMember) return data;
		const member = await this.client.resolvers.run<GuildMember>('member', data, language, guild.members).catch(noop);
		return member || toss(language.get('RESOVLER_INVALID_MEMBER', entry.key));
	}

	public serialize(data: GuildMember): string {
		return data.id;
	}

}
