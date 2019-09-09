import { Client, Guild, User } from "discord.js";
import { ModLogUserInfo, ModLogJSONData, ModLogType } from '../types';

export class ModLog {

    public client: Client;
    public guild: Guild;

    public moderator: ModLogUserInfo | null

    public user: ModLogUserInfo | null;

    public type: ModLogType | null;

    public case: number | null;

    public reason: string | null

    public constructor(guild: Guild) {
        this.client = guild.client;
        this.guild = guild;

        this.user = null;
        this.moderator = null;
        this.type = null;
        this.case = null;
        this.reason = null;
    }

    public setUser(user: User | ModLogUserInfo): this {
        this._patchUser(user, 'user');
        return this;
    }

    public setModerator(user: User | ModLogUserInfo): this {
        this._patchUser(user, 'moderator');
        return this;
    }

    public toJSON(): ModLogJSONData {
        return {
            guild: this.guild.id,
            case: this.case,
            type: this.type,
            user: this.user,
            moderator: this.moderator,
            reason: this.reason
        }
    }

    private _patchUser(data: User | ModLogUserInfo, method: 'user' | 'moderator'): void {
        this[method] = {
            avatar: data instanceof User ? data.displayAvatarURL() : data.avatar,
            id: data.id,
            tag: data.tag
        };
    }

    public static fromJSON(data: ModLogJSONData) {
    }
}