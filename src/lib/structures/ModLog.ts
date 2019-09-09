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

    public setUser(user: User | ModLogUserInfo | null): this {
        this._patchUser(user, 'user');
        return this;
    }

    public setModerator(user: User | ModLogUserInfo | null): this {
        this._patchUser(user, 'moderator');
        return this;
    }

    public setCase(caseNumber: number | null): this {
        this.case = caseNumber;
        return this;
    }

    public setReason(reason: string | null): this {
        this.reason = reason;
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

    private _patchUser(data: User | ModLogUserInfo | null, method: 'user' | 'moderator'): void {
        this[method] = data === null ? null : {
            avatar: data instanceof User ? data.displayAvatarURL() : data.avatar,
            id: data.id,
            tag: data.tag
        };
    }

    public static fromJSON(guild: Guild, data: ModLogJSONData) {
        return new this(guild)
            .setUser(data.user)
            .setModerator(data.moderator)
            .setCase(data.case)
            .setReason(data.reason);
    }
}