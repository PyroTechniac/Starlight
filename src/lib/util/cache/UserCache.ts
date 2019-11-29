import Collection from '@discordjs/collection';
import { Client, User } from 'discord.js';
import { APIUserData } from '../../types/Interfaces';
import { CacheManager } from './CacheManager';
import { api } from '../Api';

export class UserCache extends Collection<string, UserCacheData> {

	public readonly manager!: CacheManager;

	public constructor(manager: CacheManager) {
		super();
		Object.defineProperty(this, 'manager', { value: manager });
	}

	public get client(): Client {
		return this.manager.client;
	}

	public resolve(usernameOrTag: string, id: true): string | null;
	public resolve(usernameOrTag: string, id?: false): UserCacheData | null
	public resolve(usernameOrTag: string, id = false): UserCacheData | string | null {
		for (const [key, value] of this.entries()) {
			if (usernameOrTag === value.username || usernameOrTag === value.tag) return id ? key : value;
		}

		return null;
	}

	public fetch(id: string): Promise<UserCacheData> {
		const existing = super.get(id);
		if (existing) return Promise.resolve(existing);

		return (api(this.client)
			.users(id)
			.get() as Promise<APIUserData>)
			.then(this.create.bind(this));
	}

	public fetchUsername(id: string): Promise<string> {
		return this.fetch(id).then((cache): string => cache.username);
	}

	public fetchEntry(id: string): Promise<readonly [string, UserCacheData]> {
		const existent = super.get(id);
		if (existent) return Promise.resolve([id, existent] as const);
		return this.fetch(id)
			.then((data): readonly [string, UserCacheData] => [id, data] as const);
	}

	public create(data: APIUserData | User): UserCacheData {
		if (this.has(data.id)) return this.get(data.id)!.patch(data);
		const cache = new UserCacheData(this.manager, data); // eslint-disable-line @typescript-eslint/no-use-before-define
		super.set(data.id, cache);
		return cache;
	}

	public toJSON(): UserCacheDataJSON[] {
		return this.map((cache): UserCacheDataJSON => cache.toJSON());
	}

}

export class UserCacheData {

	public readonly manager!: CacheManager;
	public readonly id: string;
	public avatar: string | null;
	public username: string;
	public discriminator: string;
	public constructor(manager: CacheManager, data: User | APIUserData) {
		Object.defineProperty(this, 'manager', { value: manager });
		this.id = data.id;
		this.avatar = data.avatar;
		this.username = data.username;
		this.discriminator = data.discriminator;
	}

	public get cache(): UserCache {
		return this.manager.users;
	}

	public get tag(): string {
		return `${this.username}#${this.discriminator}`;
	}

	public get client(): Client {
		return this.manager.client;
	}

	public patch(data: Partial<APIUserData | User>): this {
		this.avatar = data.avatar ?? this.avatar ?? null;
		this.username = data.username ?? this.username;
		this.discriminator = data.discriminator ?? this.discriminator;

		return this;
	}

	public toJSON(): UserCacheDataJSON {
		return {
			id: this.id,
			avatar: this.avatar,
			username: this.username,
			discriminator: this.discriminator
		};
	}

}

interface UserCacheDataJSON {
	id: string;
	avatar: string | null;
	username: string;
	discriminator: string;
}
