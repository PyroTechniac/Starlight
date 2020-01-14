import Collection, { CollectionConstructor } from '@discordjs/collection';
import { EmojiData, GuildCacheHandler } from '../../types/Interfaces';
import { Guild, GuildEmoji } from 'discord.js';
import { RequestHandler } from '../../structures/RequestHandler';
import { cast, handleDAPIError } from '../Utils';
import { APIErrors } from '../../types/Enums';

export class EmojiCache extends Collection<string, EmojiData> implements GuildCacheHandler<GuildEmoji> {

	public handler: RequestHandler<string, GuildEmoji> = new RequestHandler<string, GuildEmoji>(
		this.request.bind(this),
		this.requestMany.bind(this)
	);

	public kPromise: Promise<void> | null = null;

	public constructor(public readonly guild: Guild) {
		super();
	}

	public async fetch(id: string): Promise<EmojiData | null>;

	public async fetch(): Promise<this>;

	public async fetch(id?: string): Promise<EmojiData | null | this> {
		if (typeof id === 'undefined') {
			if (this.kPromise === null) {
				this.kPromise = this.requestAll();
			}

			await this.kPromise;
			return this;
		}

		const existing = this.get(id);
		if (typeof existing !== 'undefined') return existing;

		const emoji = await handleDAPIError(this.handler.push(id), APIErrors.UnknownEmoji);
		return emoji ? this.create(emoji) : null;
	}

	public mapIdentifiers(): Collection<string, string> {
		return new Collection([...this.identifiers()]);
	}

	public *identifiers(): IterableIterator<[string, string]> {
		for (const data of this) yield [data[0], this.createIdentifier(data[1])];
	}

	public createIdentifier(data: EmojiData): string {
		return `${data.animated ? 'a:' : ''}${data.name}:${data.id}`;
	}

	public create(emoji: GuildEmoji): EmojiData {
		const data: EmojiData = {
			animated: emoji.animated,
			name: emoji.name,
			id: emoji.id
		} as const;
		super.set(emoji.id, data);
		return data;
	}

	public request(id: string): Promise<GuildEmoji> {
		return this.guild.emojis.fetch(id);
	}

	public requestMany(ids: readonly string[]): Promise<GuildEmoji[]> {
		return Promise.all(ids.map((id): Promise<GuildEmoji> => this.guild.emojis.fetch(id)));
	}

	public async requestAll(): Promise<void> {
		try {
			const emojis = await this.guild.emojis.fetch();
			for (const emoji of emojis.values()) this.create(emoji);
		} finally {
			this.kPromise = null;
		}
	}

	public static get [Symbol.species](): CollectionConstructor {
		return cast<CollectionConstructor>(Collection);
	}

}


