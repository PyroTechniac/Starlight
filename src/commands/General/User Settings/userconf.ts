import { Command, CommandOptions, KlasaMessage, SettingsFolder } from 'klasa';
import { admin, ApplyOptions } from '../../../lib/util/Decorators';
import { Databases } from '../../../lib/types/Enums';
import { toTitleCase } from '@klasa/utils';
import { codeblock } from '../../../lib/util/Markdown';
import { cast } from '../../../lib/util/Utils';

@ApplyOptions<CommandOptions>({
	runIn: ['text'],
	guarded: true,
	subcommands: true,
	description: (lang): string => lang.get('COMMAND_CONF_SERVER_DESCRIPTION'),
	usage: '<set|show|remove|reset> (key:key) (value:value)',
	usageDelim: ' '
})
export default class extends Command {

	@admin()
	public show(message: KlasaMessage, [key]: [string]): Promise<KlasaMessage> {
		const schemaOrEntry = this.client.schemas.get(Databases.Users, key);
		if (typeof schemaOrEntry === 'undefined') throw message.language.get('COMMAND_CONF_GET_NOEXT', key);

		const value = key ? message.author.settings.get(key) : message.author.settings;
		if (this.client.schemas.isSchemaEntry(schemaOrEntry)) {
			return message.sendLocale('COMMAND_CONF_GET', [key, this.client.schemas.displayEntry(schemaOrEntry, value)]);
		}

		return message.sendLocale('COMMAND_CONF_SERVER', [
			key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '',
			codeblock('asciidoc')`${this.client.schemas.displayFolder(Databases.Users, cast<SettingsFolder>(value))}`
		]);
	}

	public set(message: KlasaMessage, [key, valueToSet]: [string, unknown]): Promise<KlasaMessage> {
		return this.editSettings(message, key, valueToSet, 'add');
	}

	public remove(message: KlasaMessage, [key, valueToRemove]: [string, unknown]): Promise<KlasaMessage> {
		return this.editSettings(message, key, valueToRemove, 'remove');
	}

	@admin()
	public async reset(message: KlasaMessage, [key]: [string]): Promise<KlasaMessage> {
		try {
			const [update] = await message.author.settings.reset(key);
			return message.sendLocale('COMMAND_CONF_RESET', [key, this.client.schemas.displayEntry(update.entry, update.next)]);
		} catch (error) {
			throw String(error);
		}
	}

	public init(): Promise<void> {
		this
			.createCustomResolver('key', (arg, possible, message, [action]): string => {
				if (action === 'show' || arg) return arg || '';
				throw message.language.get('COMMAND_CONF_NOKEY');
			})
			.createCustomResolver('value', (arg, possible, message, [action]): unknown => {
				if (!['set', 'remove'].includes(action)) return null;
				if (arg) return this.client.arguments.get('...string')!.run(arg, possible, message);
				throw message.language.get('COMMAND_CONF_NOVALUE');
			});
		return Promise.resolve();
	}

	@admin()
	private async editSettings(message: KlasaMessage, key: string, value: unknown, arrayAction: 'add' | 'remove'): Promise<KlasaMessage> {
		try {
			const [update] = await message.author.settings.update(key, value, { onlyConfigurable: true, arrayAction });
			return message.sendLocale('COMMAND_CONF_UPDATED', [key, this.client.schemas.displayEntry(update.entry, update.next)]);
		} catch (error) {
			throw String(error);
		}
	}

}
