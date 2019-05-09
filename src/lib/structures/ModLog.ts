import { MessageEmbed, TextChannel, Message } from 'discord.js';
import { Client, KlasaGuild, KlasaUser } from 'klasa';

export type ModerationType = 'ban' | 'unban' | 'warn' | 'kick' | 'softban' | string;

export class ModLog {
    public client: Client
    public type: ModerationType | null;
    public user: { id: string; tag: string } | null;
    public moderator: { id: string; tag: string; avatar: string } | null
    public reason: string | null;
    public case: number | null
    public constructor(public guild: KlasaGuild) {
        this.client = guild.client as Client;
        this.type = null;
        this.user = null;
        this.reason = null;
        this.moderator = null;
        this.case = null;
    }

    public setType(type: ModerationType): this {
        this.type = type;
        return this;
    }

    public setUser(user: KlasaUser): this {
        this.user = {
            id: user.id,
            tag: user.tag
        };
        return this;
    }

    public setModerator(user: KlasaUser): this {
        this.moderator = {
            id: user.id,
            tag: user.tag,
            avatar: user.displayAvatarURL()
        };
        return this;
    }

    public setReason(reason: string | string[] | null = null): this {
        if (reason instanceof Array) reason = reason.join(' ');
        this.reason = reason;
        return this;
    }

    public async send(): Promise<Message | Message[]> {
        const channel = this.client.channels.get(this.guild.settings.get('channels.modlog')) as TextChannel;
        if (!channel) throw `The modlog channel does not exist, please set it with ${this.guild.settings.get('prefix')}conf set channels.modlog`;
        await this.getCase();
        return channel.send({ embed: this.embed });
    }

    private get embed(): MessageEmbed {
        const embed = this.client.util.embed()
            .setAuthor(this.moderator!.tag, this.moderator!.avatar)
            .setColor(ModLog.color(this.type!))
            .setDescription([
                `**Type**: ${this.type![0].toUpperCase() + this.type!.slice(1)}`,
                `**User**: ${this.user!.tag} (${this.user!.id})`,
                `**Reason**: ${this.reason || `Use \`${this.guild.settings.get('prefix')}reason ${this.case}\` to claim this log.`}`
            ])
            .setFooter(`Case ${this.case}`)
            .setTimestamp();
        return embed;
    }

    private async getCase(): Promise<number> {
        this.case = (this.guild.settings.get('modlogs') as any[]).length;
        const { errors } = await this.guild.settings.update('modlogs', this.pack);
        if (errors.length) throw errors[0];
        return this.case;
    }


    private get pack(): Record<string, string | number> {
        return {
            type: this.type!,
            user: this.user!.id,
            moderator: this.moderator!.id,
            reason: this.reason!,
            case: this.case!
        };
    }

    private static color(type: ModerationType): number {
        switch (type) {
            case 'ban': return 16724253;
            case 'unban': return 1822618;
            case 'warn': return 16564545;
            case 'kick': return 16573465;
            case 'softban': return 15014476;
            default: return 16777215;
        }
    }
}