import { GuildMember, Permissions, PresenceData, User, Role, Channel, Message, GuildChannel } from 'discord.js';
import { Argument, KlasaGuild, Type, util } from 'klasa';

export namespace Util {
    const { userOrMember: USER_REGEXP, role: ROLE_REGEXP, channel: CHANNEL_REGEXP } = Argument.regex;
    
    const { regExpEsc } = util;

    export const noop = (): null => null;

    export const sanitizeKeyName = (value: string): string => {
        if (typeof value !== 'string') throw new TypeError(`[SANITIZE_NAME] Expected a string, got: ${new Type(value)}`);
        if (/`|"/.test(value)) throw new TypeError(`Invalid input (${value}).`);
        if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') return value;
        return `"${value}"`;
    };

    export const transformValue = (value: any): any => {
        switch (typeof value) {
            case 'boolean':
            case 'number': return value;
            case 'object': return value === null ? value : JSON.stringify(value);
            default: return String(value);
        }
    };

    export const valueList = (length: number): string => Array.from({ length }, (): string => '?').join(', ');

    export const formatTime = (syncTime: string, asyncTime: string): string => {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
    };

    export const resolveMember = async (query: GuildMember | User | string, guild: KlasaGuild): Promise<GuildMember | null> => {
        if (query instanceof GuildMember) return query;
        if (query instanceof User) return guild.members.fetch(query.id);
        if (typeof query === 'string') {
            if (USER_REGEXP.test(query)) return guild.members.fetch(USER_REGEXP.exec(query)![1]).catch(noop);
            if (/\w{1,32}#\d{4}/.test(query)) {
                const res = guild.members.find((member): boolean => member.user.tag.toLowerCase() === query.toLowerCase());
                return res || null;
            }
        }
        return null;
    };

    export const resolveRole = async (query: Role | string, guild: KlasaGuild): Promise<Role | null> => {
        if (query instanceof Role) return guild.roles.has(query.id) ? query : null;
        // eslint-disable-next-line max-len
        if (typeof query === 'string' && ROLE_REGEXP.test(query)) return guild.roles.fetch(ROLE_REGEXP.exec(query)![1]).catch(noop) as Promise<Role | null>;
        return null;
    };

    export const resolveUser = async (query: User | GuildMember | string, guild: KlasaGuild): Promise<User | null> => {
        if (query instanceof GuildMember) return query.user;
        if (query instanceof User) return query;
        if (typeof query === 'string') {
            if (USER_REGEXP.test(query)) return guild.client.users.fetch(USER_REGEXP.exec(query)![1]).catch(noop);
            if (/\w{1,32}#\d{4}/.test(query)) {
                const res = guild.members.find((member): boolean => member.user.tag === query);
                return res ? res.user : null;
            }
        }

        return null;
    };

    export const generateArgRegex = (arg: string, escape = false): RegExp => {
        return new RegExp(escape ? `\\b${regExpEsc(arg)}\\b` : regExpEsc(arg), 'i');
    };

    export const resolveChannel = (query: Channel | Message | string, guild: KlasaGuild): GuildChannel | null => {
        if (query instanceof Channel) return guild.channels.has(query.id) ? (query as GuildChannel) : null;
        if (query instanceof Message) return query.guild!.id === guild.id ? (query.channel as GuildChannel) : null;
        if (typeof query === 'string' && CHANNEL_REGEXP.test(query)) return guild.channels.get(CHANNEL_REGEXP.exec(query)![1]) || null;
        return null;
    };
}

export namespace Constants {
    export const DefaultPresenceData: PresenceData = {
        afk: false,
        status: 'online',
        activity: {
            type: 'PLAYING',
            name: 'Starlight, help'
        }
    };

    export const RichDisplayPermissions: Permissions = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);
}