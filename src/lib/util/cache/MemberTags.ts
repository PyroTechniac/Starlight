import Collection, { CollectionConstructor } from '@discordjs/collection';
import { KlasaGuild } from 'klasa';
import { Client, GuildMember } from 'discord.js';
import { APIErrors } from '../../types/Enums';
import { cast } from '../Utils';

export class MemberTags extends Collection<string, MemberTag> {

	public readonly guild: KlasaGuild;

	public constructor(guild: KlasaGuild) {
		super();
		this.guild = guild;
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
			const members = await this.guild.members.fetch();
			for (const member of members.values()) this.create(member);
			return this;
		}

		const existing = this.get(id);
		if (typeof existing !== 'undefined') return existing;

		try {
			const member = await this.guild.members.fetch(id);
			return this.create(member);
		} catch (err) {
			if (err.code === APIErrors.UnknownMember) return null;
			throw err;
		}
	}

	public *usernames(): IterableIterator<[string, string]> {
		const { userCache } = this.client;
		for (const key of this.keys()) {
			const userTag = userCache.get(key);
			if (typeof userTag !== 'undefined') yield [key, userTag[0]];
		}
	}

	public mapUsernames(): Collection<string, string> {
		return new Collection([...this.usernames()]);
	}

	private getRawRoles(member: GuildMember): string[] {
		return cast<{ _roles: string[] } & GuildMember>(member)._roles;
	}

	public static get [Symbol.species](): CollectionConstructor {
		return Collection as unknown as CollectionConstructor;
	}

}

export interface MemberTag {
	nickname: string | null;
	roles: readonly string[];
}
