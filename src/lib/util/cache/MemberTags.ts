import Collection, { CollectionConstructor } from '@discordjs/collection';
import { KlasaGuild } from 'klasa';
import { Client, GuildMember } from 'discord.js';
import { APIErrors } from '../../types/Enums';
import { cast, handleDAPIError } from '../Utils';
import { RequestHandler } from '../../structures/RequestHandler';
import { CacheHandler } from '../../types/Interfaces';

export class MemberTags extends Collection<string, MemberTag> implements CacheHandler<GuildMember> {

	public handler: RequestHandler<string, GuildMember> = new RequestHandler<string, GuildMember>(
		this.request.bind(this),
		this.requestMany.bind(this)
	);

	private kPromise: Promise<void> | null = null;

	public constructor(public readonly guild: KlasaGuild) {
		super();
	}

	public get client(): Client {
		return this.guild.client;
	}

	public resolve(tagOrId: string): MemberTag | null {
		const ID = this.client.userCache.resolve(tagOrId, true);

		return ID ? this.get(ID) ?? null : null;
	}

	public create(member: GuildMember): MemberTag {
		const tag: MemberTag = {
			nickname: member.nickname ?? null,
			roles: this.getRawRoles(member)
		};
		super.set(member.id, tag);
		this.client.userCache.create(member.user);
		return tag;
	}

	public async fetch(id: string): Promise<MemberTag | null>;
	public async fetch(): Promise<this>;
	public async fetch(id?: string): Promise<MemberTag | null | this> {
		if (typeof id === 'undefined') {
			if (this.kPromise === null) {
				this.kPromise = this.requestAll();
			}

			await this.kPromise;
			return this;
		}

		const existing = this.get(id);
		if (typeof existing !== 'undefined') return existing;

		const member = await handleDAPIError(this.handler.push(id), APIErrors.UnknownMember);
		return member ? this.create(member) : null;
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

	public request(id: string): Promise<GuildMember> {
		return this.guild.members.fetch(id);
	}

	public requestMany(ids: readonly string[]): Promise<GuildMember[]> {
		return Promise.all(ids.map((id): Promise<GuildMember> => this.guild.members.fetch(id)));
	}

	private async requestAll(): Promise<void> {
		try {
			const members = await this.guild.members.fetch();
			for (const member of members.values()) this.create(member);
		} finally {
			this.kPromise = null;
		}
	}

	private getRawRoles(member: GuildMember): string[] {
		return cast<{ _roles: string[] } & GuildMember>(member)._roles;
	}

	public static get [Symbol.species](): CollectionConstructor {
		return cast<CollectionConstructor>(Collection);
	}

}

export interface MemberTag {
	nickname: string | null;
	roles: readonly string[];
}
