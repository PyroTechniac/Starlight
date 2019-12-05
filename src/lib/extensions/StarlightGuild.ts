import { Guild, Snowflake, Structures, User } from 'discord.js';
import { MemberNicknames } from '../util/cache/MemberNicknames';
import { api } from '../util/Api';
import { APIUserData } from '../types/Interfaces';

export class StarlightGuild extends Structures.get('Guild') {

	public readonly nicknames = new MemberNicknames(this);

	public fetchBan(id: Snowflake): Promise<{ user: User; reason: string }> {
		return (api(this.client)
			.guilds(this.id)
			.bans(id)
			.get() as Promise<{ user: APIUserData; reason: string }>)
			.then((data): { user: User; reason: string } => ({
				user: this.client.users.add(data.user),
				reason: data.reason
			}));
	}

}

Structures.extend('Guild', (): typeof Guild => StarlightGuild);
