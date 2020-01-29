import { StarlightCommand, StarlightCommandOptions } from '../../lib/structures/StarlightCommand';
import { ApplyOptions, staff } from '../../lib/util/Decorators';
import { KlasaMessage } from 'klasa';
import { GuildSettings } from '../../lib/settings/GuildSettings';

@ApplyOptions<StarlightCommandOptions>({
	description: (lang): string => lang.get('COMMAND_TAG_DESCRIPTION'),
	runIn: ['text'],
	subcommands: true,
	usage: '<add|remove|edit|source|list|show:default> (tag:string) [content:...string]',
	usageDelim: ' '
})
export default class extends StarlightCommand {

	@staff()
	public async add(message: KlasaMessage, [tagName, content]: [string, string]): Promise<KlasaMessage> {
		if (!content) throw message.language.get('COMMAND_TAG_CONTENT_REQUIRED');

		const tags = message.guild!.settings.get(GuildSettings.Tags);
		if (tags.some(([name]) => name === tagName)) throw message.language.get('COMMAND_TAG_EXISTS', tagName);
		await message.guild!.settings.update(GuildSettings.Tags, [...tags, [tagName, content]], { arrayAction: 'overwrite' });

		return message.sendLocale('COMMAND_TAG_ADDED', [tagName, content]);
	}

	@staff()
	public async remove(message: KlasaMessage, [tagName]: [string]): Promise<KlasaMessage> {
		const tags = message.guild!.settings.get(GuildSettings.Tags);

		const tag = tags.find(([name]) => name === tagName);
		if (!tag) throw message.language.get('COMMAND_TAG_NOEXISTS', tagName);
		await message.guild!.settings.update(GuildSettings.Tags, [tag], { arrayAction: 'remove' });

		return message.sendLocale('COMMAND_TAG_REMOVED', [tagName]);
	}

	@staff()
	public async edit(message: KlasaMessage, [tagName, content]: [string, string]): Promise<KlasaMessage> {
		if (!content) throw message.language.get('COMMAND_TAG_CONTENT_REQUIRED');

		const tags = message.guild!.settings.get(GuildSettings.Tags);
		const index = tags.findIndex(([name]) => name === tagName);
		if (index === -1) throw message.language.get('COMMAND_TAG_NOEXISTS', tagName);
		await message.guild!.settings.update(GuildSettings.Tags, [[tagName, content]], { arrayIndex: index });

		return message.sendLocale('COMMAND_TAG_EDITED', [tagName, content]);
	}

	public list(message: KlasaMessage): Promise<KlasaMessage> {
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		if (!tags.length) throw message.language.get('COMMAND_TAG_LIST_EMPTY');

		const prefix = message.guild!.settings.get(GuildSettings.Prefix);
		return message.sendLocale('COMMAND_TAG_LIST', [tags.map((v): string => `\`${prefix}${v[0]}\``)]);
	}

	public show(message: KlasaMessage, [tagName]: [string]): Promise<KlasaMessage> | null {
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		const tag = tags.find(([name]) => name === tagName);
		return tag ? message.send(tag[1]) : null;
	}

	public source(message: KlasaMessage, [tagName]: [string]): Promise<KlasaMessage> | null {
		const tags = message.guild!.settings.get(GuildSettings.Tags);
		const tag = tags.find(([name]) => name === tagName);
		return tag ? message.sendCode('', tag[1]) : null;
	}

	public init(): Promise<void> {
		this.createCustomResolver('string', (arg, possible, message, [action]) => {
			if (action === 'list') return undefined;
			if (!arg) throw message.language.get('RESOLVER_INVALID_STRING', possible.name);
			if (arg.includes('`') || arg.includes('\u200B')) throw message.language.get('COMMAND_TAG_NAME_NOTALLOWED');
			if (arg.length > 50) throw message.language.get('COMMAND_TAG_NAME_TOOLONG');
			return arg.toLowerCase();
		});
		return Promise.resolve();
	}

}
