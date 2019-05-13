import { KlasaClient, KlasaGuild } from 'klasa';
import { MessageEmbed, Message } from 'discord.js';
import { KlasaUser } from 'klasa';

export abstract class Log {
    protected readonly client!: KlasaClient;
    protected readonly guild!: KlasaGuild;
    protected user: { id: string; tag: string } | null
    protected type: string | null;
    public constructor(guild: KlasaGuild) {
        Object.defineProperty(this, 'client', { value: guild.client });
        Object.defineProperty(this, 'guild', { value: guild });
        this.type = null;
        this.user = null;
    }

    public abstract get embed(): MessageEmbed

    public abstract setType(type: string): this;

    protected abstract color(type: string): string | number

    public abstract setUser(user: KlasaUser): this;

    public abstract async send(): Promise<Message | Message[]>
}