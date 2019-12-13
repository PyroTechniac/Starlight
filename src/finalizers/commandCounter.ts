import { Finalizer, KlasaMessage } from 'klasa';
import { ClientSettings } from '../lib/settings/ClientSettings';
import { UserSettings } from '../lib/settings/UserSettings';
import { TextChannel } from 'discord.js';
import { GuildSettings } from '../lib/settings/GuildSettings';
import { MemberSettings } from '../lib/settings/MemberSettings';
import { TextChannelSettings } from '../lib/settings/TextChannelSettings';

export default class extends Finalizer {

	public async run(message: KlasaMessage): Promise<void> {
		const clientValue = this.client.settings!.get(ClientSettings.CommandUses);
		const authorValue = message.author.settings.get(UserSettings.CommandUses);

		await Promise.all([this.client.settings!.sync(), message.author.settings.sync()]);

		await this.client.settings!.update(ClientSettings.CommandUses, clientValue + 1);
		await message.author.settings.update(UserSettings.CommandUses, authorValue + 1);
		if (message.guild) await this.handleGuild(message);
	}

	private async handleGuild(message: KlasaMessage): Promise<void> {
		await Promise.all([
			message.guild!.settings.sync(),
			message.member!.settings.sync(),
			(message.channel as TextChannel).settings.sync()
		]);

		const guildValue = message.guild!.settings.get(GuildSettings.CommandUses);
		const memberValue = message.member!.settings.get(MemberSettings.CommandUses);
		const textValue = (message.channel as TextChannel).settings.get(TextChannelSettings.CommandUses);
		await message.guild!.settings.update(GuildSettings.CommandUses, guildValue + 1);
		await message.member!.settings.update(MemberSettings.CommandUses, memberValue + 1);
		await (message.channel as TextChannel).settings.update(TextChannelSettings.CommandUses, textValue + 1);
	}

}
