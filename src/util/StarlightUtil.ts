import * as Discord from 'discord.js';
import * as Klasa from 'klasa';
import { Stream } from 'stream';
import { MarkdownUtil } from './MarkdownUtil';


export class ClientUtil {
    public constructor(public readonly client: Klasa.KlasaClient) { }

    public markdown: MarkdownUtil = new MarkdownUtil(this)

    public resolveUser(text: string, users: Discord.Collection<Discord.Snowflake, Klasa.KlasaUser>, caseSensitive = false, wholeWord = false): Klasa.KlasaUser | undefined {
        return users.get(text) || users.find((user): boolean => this.checkUser(text, user, caseSensitive, wholeWord));
    }

    public resolveUsers(text: string, users: Discord.Collection<Discord.Snowflake, Klasa.KlasaUser>, caseSensitive = false, wholeWord = false): Discord.Collection<Discord.Snowflake, Klasa.KlasaUser> {
        return users.filter((user): boolean => this.checkUser(text, user, caseSensitive, wholeWord));
    }

    public checkUser(text: string, user: Klasa.KlasaUser, caseSensitive = false, wholeWord = false): boolean {
        if (user.id === text) return true;

        const reg = /<@!?(\d{17,19})>/;
        const match = text.match(reg);

        if (match && user.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        let {username, discriminator} = user;
        username = caseSensitive ? username : username.toLowerCase();

        if (!wholeWord) {
            return username.includes(text)
            || (username.includes(text.split('#')[0]) && discriminator.includes(text.split('#')[1]));
        }

        return username === text
        || (username === text.split('#')[0] && discriminator === text.split('#')[1]);
    }

    public resolveMember(text: string, members: Discord.Collection<Discord.Snowflake, Discord.GuildMember>, caseSensitive = false, wholeWord = false): Discord.GuildMember | undefined {
        return members.get(text) || members.find((member): boolean => this.checkMember(text, member, caseSensitive, wholeWord));
    }

    public resolveMembers(text: string, members: Discord.Collection<Discord.Snowflake, Discord.GuildMember>, caseSensitive = false, wholeWord = false): Discord.Collection<Discord.Snowflake, Discord.GuildMember> {
        return members.filter((member): boolean => this.checkMember(text, member, caseSensitive, wholeWord));
    }

    public checkMember(text: string, member: Discord.GuildMember, caseSensitive = false, wholeWord = false): boolean {
        if (member.id === text) return true;

        const reg = /<@!?(\d{17,19})>/;
        const match = text.match(reg);

        if (match && member.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const username = caseSensitive ? member.user.username : member.user.username.toLowerCase();
        const displayName = caseSensitive ? member.displayName : member.displayName.toLowerCase();
        const { discriminator } = member.user;

        if (!wholeWord) {
            return displayName.includes(text)
                || username.includes(text)
                || ((username.includes(text.split('#')[0]) || displayName.includes(text.split('#')[0])) && discriminator.includes(text.split('#')[1]));
        }

        return displayName === text
        || username === text
        || ((username === text.split('#')[0] || displayName === text.split('#')[0]) && discriminator === text.split('#')[1]);
    }

    public resolveChannel(text: string, channels: Discord.Collection<Discord.Snowflake, Discord.GuildChannel>, caseSensitive = false, wholeWord = false): Discord.GuildChannel | undefined {
        return channels.get(text) || channels.find((channel): boolean => this.checkChannel(text, channel, caseSensitive, wholeWord));
    }

    public resolveChannels(text: string, channels: Discord.Collection<Discord.Snowflake, Discord.GuildChannel>, caseSensitive = false, wholeWord = false): Discord.Collection<Discord.Snowflake, Discord.GuildChannel> {
        return channels.filter((channel): boolean => this.checkChannel(text, channel, caseSensitive, wholeWord));
    }

    public checkChannel(text: string, channel: Discord.GuildChannel, caseSensitive = false, wholeWord = false): boolean {
        if (channel.id === text) return true;

        const reg = /<#(\d{17,19})>/;
        const match = text.match(reg);

        if (match && channel.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? channel.name : channel.name.toLowerCase();

        if (!wholeWord) {
            return name.includes(text) || name.includes(text.replace(/^#/, ''));
        }

        return name === text || name === text.replace(/^#/, '');
    }

    public resolveRole(text: string, roles: Discord.Collection<Discord.Snowflake, Discord.Role>, caseSensitive = false, wholeWord = false): Discord.Role | undefined {
        return roles.get(text) || roles.find((role): boolean => this.checkRole(text, role, caseSensitive, wholeWord));
    }

    public resolveRoles(text: string, roles: Discord.Collection<Discord.Snowflake, Discord.Role>, caseSensitive = false, wholeWord = false): Discord.Collection<Discord.Snowflake, Discord.Role> {
        return roles.filter((role): boolean => this.checkRole(text, role, caseSensitive, wholeWord));
    }

    public checkRole(text: string, role: Discord.Role, caseSensitive = false, wholeWord = false): boolean {
        if (role.id === text) return true;

        const reg = /<@&(\d{17,19})>/;
        const match = text.match(reg);

        if (match && role.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? role.name : role.name.toLowerCase();

        if (!wholeWord) {
            return name.includes(text) || name.includes(text.replace(/^@/, ''));
        }

        return name === text || name === text.replace(/^@/, '');
    }

    public resolveEmoji(text: string, emojis: Discord.Collection<Discord.Snowflake, Discord.Emoji>, caseSensitive = false, wholeWord = false): Discord.Emoji | undefined {
        return emojis.get(text) || emojis.find((emoji): boolean => this.checkEmoji(text, emoji, caseSensitive, wholeWord));
    }

    public resolveEmojis(text: string, emojis: Discord.Collection<Discord.Snowflake, Discord.Emoji>, caseSensitive = false, wholeWord = false): Discord.Collection<Discord.Snowflake, Discord.Emoji> {
        return emojis.filter((emoji): boolean => this.checkEmoji(text, emoji, caseSensitive, wholeWord));
    }

    public checkEmoji(text: string, emoji: Discord.Emoji, caseSensitive = false, wholeWord = false): boolean {
        if (emoji.id === text) return true;

        const reg = /<a?:[a-zA-Z0-9_]+:(\d{17,19})>/;
        const match = text.match(reg);

        if (match && emoji.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? emoji.name : emoji.name.toLowerCase();

        if (!wholeWord) {
            return name.includes(text) || name.includes(text.replace(/:/, ''));
        }
        return name === text || name === text.replace(/:/, '');
    }

    public resolveGuild(text: string, guilds: Discord.Collection<Discord.Snowflake, Klasa.KlasaGuild>, caseSensitive = false, wholeWord = false): Klasa.KlasaGuild | undefined {
        return guilds.get(text) || guilds.find((guild): boolean => this.checkGuild(text, guild, caseSensitive, wholeWord));
    }

    public resolveGuilds(text: string, guilds: Discord.Collection<Discord.Snowflake, Klasa.KlasaGuild>, caseSensitive = false, wholeWord = false): Discord.Collection<Discord.Snowflake, Klasa.KlasaGuild> {
        return guilds.filter((guild): boolean => this.checkGuild(text, guild, caseSensitive, wholeWord));
    }

    public checkGuild(text: string, guild: Klasa.KlasaGuild, caseSensitive = false, wholeWord = false): boolean {
        if (guild.id === text) return true;
        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? guild.name : guild.name.toLowerCase();

        if (!wholeWord) return name.includes(text);
        return name === text;
    }

    public get permissionNames(): string[] {
        return Object.keys(Discord.Permissions.FLAGS);
    }

    public resolvePermissionNumber(num: number): string[] {
        const resolved: string[] = [];

        for (const key of Object.keys(Discord.Permissions.FLAGS)) {
            if (num & Discord.Permissions.FLAGS[key]) resolved.push(key);
        }

        return resolved;
    }

    public compareStreaming(oldMember: Discord.GuildMember, newMember: Discord.GuildMember): 0 | 1 | 2 {
        const s1 = oldMember.presence.activity && oldMember.presence.activity.type === 'STREAMING';
        const s2 = newMember.presence.activity && newMember.presence.activity.type === 'STREAMING';
        if (s1 === s2) return 0;
        if (s1) return 1;
        if (s2) return 2;
        return 0;
    }

    public async fetchMember(guild: Klasa.KlasaGuild, id: string, cache: boolean = true): Promise<Discord.GuildMember> {
        const user = await this.client.users.fetch(id, cache);
        return guild.members.fetch({ user, cache });
    }

    public embed(data?: Discord.MessageEmbed | Discord.MessageEmbedOptions | undefined): Discord.MessageEmbed {
        return new Discord.MessageEmbed(data);
    }

    public attachment(file: string | Buffer | Stream, name?: string | undefined): Discord.MessageAttachment {
        return new Discord.MessageAttachment(file, name);
    }

    public collection(iterable?: readonly (readonly [any, any])[] | null | undefined): Discord.Collection<any, any> {
        return new Discord.Collection(iterable);
    }
}