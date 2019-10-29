import { Structures, Collection } from 'discord.js';

export class StarlightGuild extends Structures.get('Guild') {

	public memberSnowflakes: Set<string> = new Set();

	public get memberTags(): Collection<string, string> {
		const collection = new Collection<string, string>();
		for (const snowflake of this.memberSnowflakes) {
			const username = this.client.usertags.get(snowflake);
			if (username) collection.set(snowflake, username);
		}
		return collection;
	}

	public get memberUsernames(): Collection<string, string> {
		const coll = new Collection<string, string>();
		for (const snowflake of this.memberSnowflakes) {
			const username = this.client.usertags.get(snowflake);
			if (username) coll.set(snowflake, username.slice(0, username.indexOf('#')));
		}

		return coll;
	}

}
