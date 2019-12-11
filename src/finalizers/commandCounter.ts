import { Finalizer, KlasaMessage } from 'klasa';
import { ClientSettings } from '../lib/settings/ClientSettings';
import { UserSettings } from '../lib/settings/UserSettings';
import { Guild } from 'discord.js';
import { GuildSettings } from '../lib/settings/GuildSettings';

export default class extends Finalizer {

	public async run(message: KlasaMessage): Promise<void> {
		const clientValue = this.client.settings!.get(ClientSettings.CommandUses);
		const authorValue = message.author.settings.get(UserSettings.CommandUses);

		await Promise.all([this.client.settings!.sync(), message.author.settings.sync()]);

		await this.client.settings!.update(ClientSettings.CommandUses, clientValue + 1);
		await message.author.settings.update(UserSettings.CommandUses, authorValue + 1);
		if (message.guild) await this.handleGuild(message.guild);
	}

	private async handleGuild(guild: Guild): Promise<void> {
		await guild.settings.sync();

		const guildValue = guild.settings.get(GuildSettings.CommandUses);
		await guild.settings.update(GuildSettings.CommandUses, guildValue + 1);
	}

}
