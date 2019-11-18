import Collection from '@discordjs/collection';
import { Client, User } from 'discord.js';
import { APIUserData } from '../../types/Interfaces';
import { CacheManager } from './CacheManager';

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
		const pieces = usernameOrTag.split('#', 2) as [string, string];
		if (pieces.length !== 2 || pieces[1].length !== 4) {
			return id
				? this._resolveFromUsername(usernameOrTag, true)
				: this._resolveFromUsername(usernameOrTag, false);
		}
		return id
			? this._resolveFromTag(pieces, true)
			: this._resolveFromTag(pieces, false);

		// return id
		// 	? this._resolveFromTag(usernameOrTag, id) ?? this._resolveFromUsername(usernameOrTag, id)
		// 	: this._resolveFromTag(usernameOrTag) ?? this._resolveFromUsername(usernameOrTag);

	}

	public async fetch(id: string): Promise<UserCacheData> {
		const existing = super.get(id);
		if (existing) return existing;

		const user = await this.client.users.fetch(id);
		return this.create(user);
	}

	public fetchUsername(id: string): Promise<string> {
		return this.fetch(id).then(cache => cache.username);
	}

	public async fetchEntry(id: string): Promise<readonly [string, UserCacheData]> {
		const existent = super.get(id);
		if (existent) return [id, existent] as const;

		const user = await this.client.users.fetch(id);
		return [id, this.create(user)] as const;
	}

	public create(data: APIUserData | User): UserCacheData {
		const cache: UserCacheData = {
			avatar: data.avatar,
			username: data.username,
			discriminator: data.discriminator
		} as const;
		super.set(data.id, cache);
		return cache;
	}

	private _resolveFromTag([username, discriminator]: [string, string], returnID: true): string | null;
	private _resolveFromTag([username, discriminator]: [string, string], returnID?: false): UserCacheData | null;
	private _resolveFromTag([username, discriminator]: [string, string], returnID = false): UserCacheData | string | null {
		for (const [key, value] of this.entries()) {
			if (username === value.username && discriminator === value.discriminator) return returnID ? key : value;
		}

		return null;
	}

	private _resolveFromUsername(username: string, returnID: true): string | null;
	private _resolveFromUsername(username: string, returnID?: false): UserCacheData | null
	private _resolveFromUsername(username: string, returnID = false): UserCacheData | string | null {
		for (const [key, value] of this.entries()) {
			if (value.username === username) return returnID ? key : value;
		}

		return null;
	}

}


export interface UserCacheData {
	readonly avatar: string | null;
	readonly username: string;
	readonly discriminator: string;
}
