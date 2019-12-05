import { Collection, GuildMember, GuildMemberStore, Snowflake } from 'discord.js';
import { Settings } from 'klasa';

export class StarlightGuildMemberStore extends GuildMemberStore {

	public async _fetchSingle(options): Promise<GuildMember> {
		const member = await super._fetchSingle(options);
		await member.settings.sync();
		return member;
	}

	public async _fetchMany(options): Promise<Collection<Snowflake, GuildMember>> {
		const members = await super._fetchMany(options);
		await Promise.all(members.map((member): Promise<Settings> => member.settings.sync()));
		return members;
	}

}
