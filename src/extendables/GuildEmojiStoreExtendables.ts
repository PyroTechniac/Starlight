import { Extendable, ExtendableStore } from 'klasa';
import { Collection, GuildEmoji, GuildEmojiStore, Snowflake } from 'discord.js';
import { api } from '../lib/util/Api';

export default class extends Extendable {

	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [GuildEmojiStore] });
	}

	public fetch(emoji: Snowflake, cache?: boolean): Promise<GuildEmoji>;
	public fetch(emoji?: Snowflake, cache?: boolean): Promise<Collection<Snowflake, GuildEmoji>>;
	public fetch(this: GuildEmojiStore, emoji?: Snowflake, cache = true): Promise<Collection<Snowflake, GuildEmoji> | GuildEmoji> {
		return typeof emoji === 'string' ? fetchSingle.call(this, emoji, cache) : fetchAll.call(this, cache);
	}

}

async function fetchSingle(this: GuildEmojiStore, emoji: Snowflake, cache: boolean): Promise<GuildEmoji> {
	const existing = this.get(emoji);
	if (typeof existing !== 'undefined') return existing;
	const data: object = await api(this.client).guilds(this.guild.id).emojis(emoji)
		.get() as object;
	return this.add(data, cache);
}

async function fetchAll(this: GuildEmojiStore, cache: boolean): Promise<Collection<Snowflake, GuildEmoji>> {
	const data = await api(this.client).guilds(this.guild.id).emojis.get() as { id: string }[];
	const emojis = new Collection<Snowflake, GuildEmoji>();
	for (const emoji of data) emojis.set(emoji.id, this.add(emoji, cache));
	return emojis;
}
