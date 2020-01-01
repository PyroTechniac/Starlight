import { isFunction, isNumber } from '@klasa/utils';
import { Collection, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { Command, CommandOptions, KlasaMessage } from 'klasa';
import { GuildSettings } from '../../../lib/settings/GuildSettings';
import { UserRichDisplay } from '../../../lib/structures/UserRichDisplay';
import { BaseColors } from '../../../lib/types/Enums';
import { ApplyOptions } from '../../../lib/util/Decorators';
import { getColor, noop } from '../../../lib/util/Utils';
import { StarlightCommand } from '../../../lib/structures/StarlightCommand';

const PERMISSIONS_RICHDISPLAY = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]).freeze();

@ApplyOptions<CommandOptions>({
	aliases: ['commands', 'cmds', 'cmd'],
	description: (lang): string => lang.get('COMMAND_HELP_DESCRIPTION'),
	guarded: true,
	usage: '(Command:command{3}|page:integer|category:category)',
	flagSupport: true,
	flags: {
		categories: 'literal',
		cat: 'literal',
		all: 'literal'
	}
})
export default class extends StarlightCommand {

	public init(): Promise<void> {
		this
			.createCustomResolver('command', (arg, possible, message): Promise<Command | void> => {
				if (!arg) return Promise.resolve(undefined);
				return this.client.arguments.get('commandname')!.run(arg, possible, message);
			})
			.createCustomResolver('category', async (arg, _, msg): Promise<void | number> => {
				if (!arg) return undefined;
				arg = arg.toLowerCase();
				const commandsByCategory = await this._fetchCommands(msg);

				for (const [page, category] of commandsByCategory.keyArray().entries()) {
					if (category.toLowerCase() === arg) return page + 1;
				}
				return undefined;
			});
		return Promise.resolve();
	}

	public async run(message: KlasaMessage, [commandOrPage]: [Command | number | undefined]): Promise<KlasaMessage | null> {
		if (message.flagArgs.categories || message.flagArgs.cat) {
			const commandsByCategory = await this._fetchCommands(message);
			let i = 0;
			const commandCategories: string[] = [];
			for (const [category, commands] of commandsByCategory) {
				const line = String(++i).padStart(2, '0');
				commandCategories.push(`\`${line}.\` **${category}** → ${message.language.get('COMMAND_HELP_COMMAND_COUNT', commands.length)}`);
			}
			return message.sendMessage(commandCategories);
		}

		const command = typeof commandOrPage === 'object' ? commandOrPage : null;
		if (command) {
			return message.sendMessage([
				message.language.get('COMMAND_HELP_TITLE', command.name, isFunction(command.description) ? command.description(message.language) : command.description),
				message.language.get('COMMAND_HELP_USAGE', command.usage.fullUsage(message)),
				message.language.get('COMMAND_HELP_EXTENDED', isFunction(command.extendedHelp) ? command.extendedHelp(message.language) : command.extendedHelp)
			].join('\n'));
		}

		if (!message.flagArgs.all && message.guild && (message.channel as TextChannel).permissionsFor(this.client.user!)!.has(PERMISSIONS_RICHDISPLAY)) {
			const response = await message.sendMessage(
				message.language.get('COMMAND_HELP_ALL_FLAG', message.guildSettings.get(GuildSettings.Prefix)),
				new MessageEmbed({ description: message.language.get('SYSTEM_LOADING'), color: BaseColors.Secondary })
			);
			const display = await this.buildDisplay(message);

			const page = isNumber(commandOrPage) ? commandOrPage - 1 : null;
			const startPage = page === null || page < 0 || page >= display.pages.length
				? null
				: page;
			await display.start(response, message.author.id, startPage === null ? undefined : { startPage });
			return response;
		}

		try {
			const response = await message.author.send(await this.buildHelp(message), { split: { 'char': '\n' } }) as KlasaMessage;
			return message.channel.type === 'dm' ? response : message.sendLocale('COMMAND_HELP_DM');
		} catch {
			return message.channel.type === 'dm' ? null : message.sendLocale('COMMAND_HELP_NODM');
		}
	}

	private async buildHelp(message: KlasaMessage): Promise<string> {
		const commands = await this._fetchCommands(message);
		const prefix = message.guildSettings.get(GuildSettings.Prefix);

		const helpMessage: string[] = [];
		for (const [category, list] of commands) {
			helpMessage.push(`**${category} Commands**:\n`, list.map(this.formatCommand.bind(this, message, prefix, false)).join('\n'), '');
		}

		return helpMessage.join('\n');
	}

	private async buildDisplay(message: KlasaMessage): Promise<UserRichDisplay> {
		const commandsByCategory = await this._fetchCommands(message);
		const prefix = message.guildSettings.get(GuildSettings.Prefix);

		const display = new UserRichDisplay(new MessageEmbed({ color: getColor(message) }));

		for (const [category, commands] of commandsByCategory) {
			display.addPage(new MessageEmbed()
				.setColor(getColor(message))
				.setTitle(`${category} Commands`)
				.setDescription(commands.map(this.formatCommand.bind(this, message, prefix, true)).join('\n')));
		}

		return display;
	}

	private formatCommand(message: KlasaMessage, prefix: string, richDisplay: boolean, command: Command): string {
		const description = isFunction(command.description) ? command.description(message.language) : command.description;
		return richDisplay ? `• ${prefix}${command.name} → ${description}` : `• **${prefix}${command.name}** → ${description}`;
	}

	private async _fetchCommands(message: KlasaMessage): Promise<Collection<string, Command[]>> {
		const run = this.client.inhibitors.run.bind(this.client.inhibitors, message);
		const commands = new Collection<string, Command[]>();
		await Promise.all(this.client.commands.map(command => run(command, true)
			.then((): null => {
				const category = commands.get(command.category);
				if (category) category.push(command);
				else commands.set(command.category, [command]);
				return null;
			}).catch(noop)));

		return commands;
	}

}
