import Collection from "@discordjs/collection";
import {Client, User} from "discord.js";
import {APIUserData} from "../../types/Interfaces";
import {CacheManager} from "./CacheManager";

export class UserCache extends Collection<string, UserCacheData> {
    public readonly manager!: CacheManager

    public constructor(manager: CacheManager) {
        super();
        Object.defineProperty(this, 'manager', {value: manager});
    }

    public get client(): Client {
        return this.manager.client;
    }

    public resolve(usernameOrTag: string) {
        return this._resolveFromTag(usernameOrTag) ?? this._resolveFromUsername(usernameOrTag);
    }

    public resolveID(usernameOrTag: string) {
        return this._resolveFromTag(usernameOrTag, true) ?? this._resolveFromUsername(usernameOrTag, true);
    }

    public async fetch(id: string) {
        const existing = super.get(id);
        if (existing) return existing;

        const user = await this.client.users.fetch(id);
        return this.create(user);
    }

    public fetchUsername(id: string) {
        return this.fetch(id).then((cache) => cache.username);
    }

    public async fetchEntry(id: string) {
        const existent = super.get(id);
        if (existent) return [id, existent] as const;

        const user = await this.client.users.fetch(id);
        return [id, this.create(user)] as const;
    }

    public create(data: APIUserData | User) {
        const cache: UserCacheData = {
            avatar: data.avatar,
            username: data.username,
            discriminator: data.discriminator
        } as const;
        super.set(data.id, cache);
        return cache;
    }

    private _resolveFromTag(tag: string, returnID: boolean = false) {
        const pieces = tag.split('#', 2);
        if (pieces.length !== 2 || pieces[1].length !== 4) return null;

        const [username, discriminator] = pieces;
        for (const [key, value] of this.entries()) {
            if (username === value.username && discriminator === value.discriminator) return returnID ? key : value;
        }

        return null;
    }

    private _resolveFromUsername(username: string, returnID: boolean = false) {
        for (const [key, value] of this.entries()) {
            if (value.username === username) return returnID ? key : value;
        }

        return null;
    }
}


export interface UserCacheData {
    readonly avatar: string | null;
    readonly username: string
    readonly discriminator: string;
}