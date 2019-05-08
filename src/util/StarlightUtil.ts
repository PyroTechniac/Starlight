import * as Discord from 'discord.js';
import * as Klasa from 'klasa';
import { Stream } from 'stream';


export class ClientUtil {
    public constructor(public readonly client: Klasa.KlasaClient) { }

    public resolveEmoji(text: string, emojis: Discord.Collection<Discord.Snowflake, Discord.Emoji>, caseSensitive = false, wholeWord = false): Discord.Emoji {
        return emojis.get(text) || emojis.find((emoji): boolean => this.checkEmoji)
    }

    public resolveEmojis(text: string, emojis: Discord.Collection<Discord.Snowflake, Discord.Emoji>, caseSensitive = false, wholeWord = false): Discord.Collection<Discord.Snowflake, Discord.Emoji> {
        return emojis.filter((emoji): boolean => this.checkEmoji(text, emoji, caseSensitive, wholeWord));
    }

    public checkEmoji(text: string, emoji: Discord.Emoji, caseSensitive = false, wholeWord = false): boolean {
        if (emoji.id === text) return true;

        const reg = /<a?:[a-zA-Z0-9_]+:(\d{17,19})>/
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

    public async fetchMember(guild: Klasa.KlasaGuild, id: string, cache: boolean): Promise<Discord.GuildMember> {
        const user = await this.client.users.fetch(id, cache);
        return guild.members.fetch({ user, cache });
    }

    public embed(data: Discord.MessageEmbed | Discord.MessageEmbedOptions | undefined): Discord.MessageEmbed {
        return new Discord.MessageEmbed(data);
    }

    public attachment(file: string | Buffer | Stream, name?: string | undefined): Discord.MessageAttachment {
        return new Discord.MessageAttachment(file, name);
    }

    public collection(iterable: Iterable<readonly [any, any]>): Discord.Collection<any, any> {
        return new Discord.Collection(iterable);
    }
}