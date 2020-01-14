import Collection, { CollectionConstructor } from '@discordjs/collection';
import { APIUserData, CacheHandler, UserData } from '../../types/Interfaces';
import { ClientCacheEngine } from './ClientCacheEngine';
import { Client, User } from 'discord.js';
import { Engine } from '../Engine';
import { ClientEngine } from '../../structures/ClientEngine';
import { cast, handleDAPIError } from '../Utils';
import { APIErrors } from '../../types/Enums';
import { RequestHandler } from '../../structures/RequestHandler';

export class UserCache extends Collection<string, UserData> implements Engine, CacheHandler<User> {

	public handler: RequestHandler<string, User> = new RequestHandler<string, User>(
		this.request.bind(this),
		this.requestMany.bind(this)
	);

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
		const isTag = this.isTag(usernameOrTag);
		for (const [key, value] of super.entries()) {
			if (usernameOrTag === `${value[0]}${isTag ? `#${value[1]}` : ''}`) return id ? key : value;
		}

		return null;
	}

	public create(data: User | APIUserData): UserData {
		const created: UserData = {
			avatar: data.avatar,
			username: data.username,
			discriminator: data.discriminator
		} as const;
		super.set(data.id, created);
		return created;
	}

	public async fetch(id: string): Promise<UserData | null> {
		const existing = super.get(id);
		if (typeof existing !== 'undefined') return existing;

		// // const user = await this.client.users.fetch(id);
		// const user = await handleDAPIError(this.client.users.fetch(id), APIErrors.UnknownUser);
		// return user ? this.create(user) : null;
		const user = await handleDAPIError(this.handler.push(id), APIErrors.UnknownUser);
		return user ? this.create(user) : null;
	}

	public *usernames(): IterableIterator<string> {
		for (const { username } of super.values()) yield username;
	}

	public *tags(): IterableIterator<string> {
		for (const { username, discriminator: discrim } of super.values()) yield `${username}#${discrim}`;
	}

	public request(id: string): Promise<User> {
		return this.client.users.fetch(id);
	}

	public requestMany(ids: readonly string[]): Promise<User[]> {
		return Promise.all(ids.map((id): Promise<User> => this.client.users.fetch(id)));
	}

	private isTag(tag: string): boolean {
		const pieces = tag.split('#', 2);
		return (pieces.length === 2 && pieces[1].length === 4);
	}

	public static get [Symbol.species](): CollectionConstructor {
		return cast<CollectionConstructor>(Collection);
	}

}
