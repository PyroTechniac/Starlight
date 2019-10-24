import { Command, CommandOptions, KlasaMessage, util } from 'klasa';
import { ApplyOptions, CreateResolver } from '../../lib/util/Decorators';
import { UserSettings } from '../../lib/settings/UserSettings';
import { codeblock, code } from 'discord-md-tags';
import { Util, MessageEmbed } from 'discord.js';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { cutText } from '../../lib/util/Utils';

@ApplyOptions<CommandOptions>({
	usage: '<create|delete|list|view> (title:string) [content:...string]',
	usageDelim: ' ',
	subcommands: true
})
@CreateResolver('string', (arg, possible, message, [action]) => {
	if (['list', 'view'].includes(action)) return arg;
	return message.client.arguments.get('string').run(arg, possible, message);
})
export default class extends Command {

	public async create(message: KlasaMessage, [title, content]: [string, string]): Promise<KlasaMessage> {
		await message.author.settings.sync();
		await message.author.settings.update(UserSettings.Notes, [...message.author.settings.get(UserSettings.Notes), [title.toLowerCase(), content]], { arrayAction: 'overwrite' });
		return message.send(`Created a note ${title} with content: ${codeblock`${Util.escapeMarkdown(content)}`}`);
	}

	public async delete(message: KlasaMessage, [note]: [string]): Promise<KlasaMessage> {
		await message.author.settings.sync();
		const filtered = message.author.settings.get(UserSettings.Notes).filter(([title]) => title !== note.toLowerCase());
		await message.author.settings.update(UserSettings.Notes, filtered, { arrayAction: 'overwrite' });
		return message.send(`Removed the note ${code`${note}`}`);
	}

	public async list(message: KlasaMessage): Promise<KlasaMessage> {
		await message.author.settings.sync();
		const notes = message.author.settings.get(UserSettings.Notes);
		if (!notes.length) throw 'You don\'t have any notes!';

		const color = (message.member && message.member.displayColor) || 0xFFAB2D;

		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(color)
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL()));

		const pages = util.chunk(notes.map(([title, content]) => `${code`${title}`} - ${cutText(content, 40)}`), 10);

		for (const page of pages) display.addPage((template: MessageEmbed) => template.setDescription(page.join('\n')));

		const response = await message.sendEmbed(new MessageEmbed({ description: message.language.get('SYSTEM_LOADING'), color }));
		await display.start(response, message.author.id);
		return response;
	}

	public async view(message: KlasaMessage, [title]: [string]) {
		await message.author.settings.sync();
		const note = message.author.settings.get(UserSettings.Notes).find(([name]) => name === title.toLowerCase());
		if (!note) throw "No note found with that title.";
		return message.sendEmbed(this.makeEmbed(...note));
	}

	private makeEmbed(title: string, content: string): MessageEmbed {
		return new MessageEmbed()
			.setTitle(title)
			.setDescription(cutText(content, 2000));
	}
}
