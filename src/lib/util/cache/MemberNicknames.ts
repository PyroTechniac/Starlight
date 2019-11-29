import Collection, { CollectionConstructor } from '@discordjs/collection';
import { Client, Guild, GuildMember } from 'discord.js';
import { APIErrors } from '../../types/Enums';
import { CacheManager } from './CacheManager';

export class MemberNicknames extends Collection<string, string | null> {

	public readonly manager!: CacheManager;
	public readonly guildID: string;

	public constructor(manager: CacheManager, id: string) {
		super();
		Object.defineProperty(this, 'manager', { value: manager });
		this.guildID = id;
	}

	public get client(): Client {
		return this.manager.client;
	}

	public get guild(): Guild {
		return this.client.guilds.get(this.guildID)!;
	}

	public resolve(tagOrID: string): string | null {
		const ID = this.client.userCache.resolve(tagOrID, true);

		return ID ? this.get(ID) ?? null : null;
	}

	public create(member: GuildMember): string | null {
		super.set(member.id, member.nickname ?? null);
		this.client.userCache.create(member.user);
		return member.nickname;
	}

	public async fetch(id: string): Promise<string | null>;
	public async fetch(): Promise<this>;
	public async fetch(id?: string): Promise<string | null | this> {
		if (typeof id === 'undefined') {
			const members = await this.guild.members.fetch();
			for (const member of members.values()) this.create(member);
			return this;
		}
		const existing = this.get(id);
		if (typeof existing !== 'undefined') return existing;

		try {
			const member = await this.guild.members.fetch(id);
			return this.create(member);
		} catch (e) {
			if (e.code === APIErrors.UnknownMember) return null;
			throw e;
		}
	}

	public *usernames(): IterableIterator<[string, string]> {
		const { userCache } = this.client;
		for (const key of this.keys()) {
			const userTag = userCache.get(key);
			if (typeof userTag !== 'undefined') yield [key, userTag.username];
		}
	}

	public mapUsernames(): Collection<string, string> {
		return new Collection([...this.usernames()]);
	}

	public static get [Symbol.species](): CollectionConstructor {
		return Collection as unknown as CollectionConstructor;
	}

}
