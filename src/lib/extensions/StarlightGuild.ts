import { Structures, Collection } from 'discord.js';

export class StarlightGuild extends Structures.get('Guild') {

	public memberSnowflakes: Set<string> = new Set();

	public get memberTags(): Collection<string, string> {
		const collection = new Collection<string, string>();
		const { userCache } = this.client;
		for (const snowflake of this.memberSnowflakes) {
			const data = userCache.get(snowflake);
			if (data) collection.set(snowflake, `${data.username}#${data.discriminator}`);
		}
		return collection;
	}

	public get memberUsernames(): Collection<string, string> {
		const coll = new Collection<string, string>();
		const { userCache } = this.client;
		for (const snowflake of this.memberSnowflakes) {
			const data = userCache.get(snowflake);
			if (data) coll.set(snowflake, data.username);
		}

		return coll;
	}

}
