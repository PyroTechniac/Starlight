import { Command, CommandOptions, KlasaMessage, Language } from 'klasa';
import { admin, ApplyOptions } from '../../lib/util/Decorators';
import { GuildSettings } from '../../lib/settings/GuildSettings';

@ApplyOptions<CommandOptions>({
	aliases: ['setPrefix'],
	cooldown: 5,
	description: (lang: Language): string => lang.get('COMMAND_PREFIX_DESCRIPTION'),
	permissionLevel: 0,
	runIn: ['text'],
	usage: '[reset|prefix:str{1,10}]'
})
export default class extends Command {

	public async run(message: KlasaMessage, [prefix]: ['reset' | string | undefined]): Promise<KlasaMessage> {
		return prefix ? this.set(message, prefix) : message.sendLocale('COMMAND_PREFIX_REMINDER', [message.guild!.settings.get(GuildSettings.Prefix)]);
	}

	@admin()
	private async set(message: KlasaMessage, prefix: 'reset' | string): Promise<KlasaMessage> {
		if (prefix === 'reset') return this.reset(message);
		if (message.guild!.settings.get(GuildSettings.Prefix) === prefix) throw message.language.get('INHIBITOR_PERMISSIONS');
		await message.guild!.settings.update(GuildSettings.Prefix, prefix);
		return message.sendLocale('COMMAND_PREFIX_CHANGED', [prefix]);
	}

	private async reset(message: KlasaMessage): Promise<KlasaMessage> {
		await message.guild!.settings.reset(GuildSettings.Prefix);
		return message.sendLocale('COMMAND_PREFIX_RESET');
	}

}
