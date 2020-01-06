import Collection, { CollectionConstructor } from '@discordjs/collection';
import { UserData } from '../../types/Types';
import { ClientCacheEngine } from './ClientCacheEngine';
import { Client, User } from 'discord.js';
import { APIUserData } from '../../types/Interfaces';
import { Engine } from '../Engine';
import { ClientEngine } from '../../structures/ClientEngine';

export class UserCache extends Collection<string, UserData> implements Engine {

	public constructor(public readonly cache: ClientCacheEngine) {
		super();
	}

	public get engine(): ClientEngine {
		return this.cache.engine;
	}

	public get client(): Client {
		return this.cache.client;
	}

	public resolve(usernameOrTag: string, id: true): string | null;
	public resolve(usernameOrTag: string, id?: false): UserData | null;
	public resolve(usernameOrTag: string, id = false): UserData | string | null {
		const isTag = UserCache.isTag(usernameOrTag);
		for (const [key, value] of super.entries()) {
			if (usernameOrTag === `${value[0]}${isTag ? `#${value[1]}` : ''}`) return id ? key : value;
		}

		return null;
	}

	public create(data: User | APIUserData): UserData {
		const created: UserData = [data.username, data.discriminator, data.avatar];
		super.set(data.id, created);
		return created;
	}

	public async fetch(id: string): Promise<UserData> {
		const existing = super.get(id);
		if (typeof existing !== 'undefined') return existing;

		const user = await this.client.users.fetch(id);
		return this.create(user);
	}

	public *usernames(): IterableIterator<string> {
		for (const [username] of super.values()) yield username;
	}

	public *tags(): IterableIterator<string> {
		for (const [username, discrim] of super.values()) yield `${username}#${discrim}`;
	}

	public static get [Symbol.species](): CollectionConstructor {
		return Collection as unknown as CollectionConstructor;
	}

	private static isTag(tag: string): boolean {
		const pieces = tag.split('#', 2);
		return (pieces.length === 2 && pieces[1].length === 4);
	}

}
