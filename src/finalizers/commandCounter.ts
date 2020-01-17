import { Command, Finalizer, KlasaMessage } from 'klasa';
import { ClientSettings } from '../lib/settings/ClientSettings';
import { UserSettings } from '../lib/settings/UserSettings';
import { GuildSettings } from '../lib/settings/GuildSettings';
import { MemberSettings } from '../lib/settings/MemberSettings';
import { TextChannelSettings } from '../lib/settings/TextChannelSettings';

export default class extends Finalizer {

	public async run(message: KlasaMessage, command: Command): Promise<void> {
		await Promise.all([this.client.settings!.sync(), message.author.settings.sync()]);

		await this.client.settings!.increase(ClientSettings.CommandUses, 1);
		await message.author.settings.increase(UserSettings.CommandUses, 1);
		await this.client.settings!.update(ClientSettings.LastCommand, command);
		await message.author.settings.update(ClientSettings.LastCommand, Command);
		if (message.guild) await this.handleGuild(message);
	}

	private async handleGuild(message: KlasaMessage): Promise<void> {
		await Promise.all([
			message.guild!.settings.sync(),
			message.member!.settings.sync(),
			message.text!.settings.sync()
		]);

		await message.guild!.settings.increase(GuildSettings.CommandUses, 1);
		await message.member!.settings.increase(MemberSettings.CommandUses, 1);
		await message.text!.settings.increase(TextChannelSettings.CommandUses, 1);
	}

}
