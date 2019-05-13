import { KlasaGuild } from 'klasa';
import { Log } from './Log';
import { User, MessageEmbed, TextChannel, Message } from 'discord.js';

export class ModLog extends Log {
    private reason: string | null;
    private case: number | null;
    private moderator: { id: string; tag: string; avatar: string } | null;
    public constructor(guild: KlasaGuild) {
        super(guild);
        this.reason = null;
        this.case = null;
        this.moderator = null;
    }

    public setType(type: string): this {
        this.type = type;
        return this;
    }

    public setUser(user: User): this {
        const { id, tag } = user;
        this.user = { id, tag };
        return this;
    }

    public setModerator(user: User): this {
        const { id, tag } = user;
        this.moderator = { id, tag, avatar: user.displayAvatarURL() };
        return this;
    }

    public setReason(reason: string | string[] | null = null): this {
        if (Array.isArray(reason)) reason = reason.join(' ');
        this.reason = reason;
        return this;
    }

    public async send(): Promise<Message | Message[]> {
        const channel = this.guild.channels.get(this.guild.settings.get('channels.modlog'));
        if (!channel) throw 'The modlog channel does not exist';
        await this.getCase();
        const { embed } = this;
        return (channel as TextChannel).send({ embed });
    }

    public get embed(): MessageEmbed {
        const embed = new MessageEmbed()
            .setAuthor(this.moderator!.tag, this.moderator!.avatar)
            .setColor(this.color(this.type!))
            .setDescription([
                `**Type**: ${this.type![0].toUpperCase() + this.type!.slice(1)}`,
                `**User**: ${this.user!.tag} (${this.user!.id})`,
                `**Reason**: ${this.reason || `Use \`${this.guild.settings.get('prefix')}reason ${this.case}\` to claim this log.`}`
            ])
            .setFooter(`Case ${this.case!}`)
            .setTimestamp();
        return embed;
    }

    private async getCase(): Promise<number> {
        this.case = (this.guild.settings.get('modlogs') as any[]).length;
        const { errors } = await this.guild.settings.update('modlogs', this.pack);
        if (errors.length) throw errors[0];
        return this.case;
    }

    private get pack(): { [key: string]: string | number | null } {
        return {
            type: this.type,
            user: this.user!.id,
            moderator: this.moderator!.id,
            reason: this.reason,
            case: this.case
        };
    }

    protected color(type: string): number {
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