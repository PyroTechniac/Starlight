import { Guild, Client } from 'discord.js';

export class MusicInterface {
    public readonly guild!: Guild;
    public readonly client!: Client;
    public constructor(guild: Guild) {
        Object.defineProperty(this, 'client', { value: guild.client });
        Object.defineProperty(this, 'guild', { value: guild });
    }
}