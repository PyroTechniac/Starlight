import { ModLog } from './ModLog';
import { Guild, Client } from 'discord.js';
import { GuildSettings } from '../settings';

export class ModManager extends Array<ModLog> {

	public readonly guild!: Guild;
	public constructor(guild: Guild) {
		super();

		Object.defineProperty(this, 'guild', { value: guild });
	}

	public get client(): Client {
		return this.guild.client;
	}

	public init(): this {
		for (const modLogData of (this.guild.settings.get(GuildSettings.ModLogs) as GuildSettings.ModLogs)) {
			this.push(ModLog.fromJSON(this.guild, modLogData));
		}

		return this;
	}

	public async fetch(): Promise<this> {
		await this.guild.settings.sync();
		return this.init();
	}

}
