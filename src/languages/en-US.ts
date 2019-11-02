import { Language } from 'klasa';
import { TranslationHelper } from '../lib/structures/TranslationHelper';
import { PieceExtendedLanguageJSON } from '../lib/types/Interfaces';
import { PERMS } from '../lib/util/Constants';

export default class extends Language {

	public language: Record<string, string | string[] | ((...args: any[]) => string | string[])> = {
		COMMAND_HEAPSNAPSHOT_DESCRIPTION: 'Creates a heapdump for finding memory leaks.',
		COMMAND_HEAPSNAPSHOT_EXTENDEDHELP: [
			'The heapsnapshot command is very useful for bots that have memory issues, it uses the heapdump library',
			'which freezes the entire process for a moment to analize all elements from the process\' HEAP, NEVER share',
			'heapsnapshot files with anybody, as everything your bot holds is included in that file.\n\nTo open heapsnapshot',
			'files, open Google Chrome, open Developer Tools, go to the tab Memory, and in Profiles, click on the buttom "load".',
			'Finally, open the profile and you will be given a table of all objects in your process, have fun!\n\nP.S:',
			'heapsnapshot files are as big as the amount of RAM you use, in big bots, the snapshots can freeze the bot',
			'much longer and the files can be much heavier.'
		].join(' '),
		COMMAND_EXEC_AWAITING: 'Executing your command...',
		COMMAND_EXEC_NO_OUTPUT: 'Done. There was no output to stdout or stderr.',
		COMMAND_HEAPSNAPSHOT_CAPTURING: (used: string): string => `Capturing HEAP Snapshot, this may take a while. RAM Usage: ${used} MB`,
		COMMAND_HEAPSNAPSHOT_CAPTURED: (path: string): string => `Captured in \`${path}\`, check! Remember, do NOT share this with anybody, it may contain a lot of sensitive data.`,
		RESOLVER_NO_RESULTS: (name: string, type: string): string => `${name} Must be a valid name, ID, or ${this.helper.get(type)} mention`,
		RESOLVER_MULTIPLE_RESULTS: (mapped: string): string => `Found multiple matches: \`${mapped}\``,
		COMMAND_SUBREDDIT_DESCRIPTION: 'Returns information on a subreddit.',
		COMMAND_SUBREDDIT_ERROR: 'There was an error. Reddit may be down, or the subreddit doesn\'t exist.',
		COMMAND_SUBREDDIT_NOEXIST: 'That subreddit doesn\'t exist.',
		SYSTEM_LOADING: 'Loading data...',
		COMMAND_PREFIX_DESCRIPTION: 'Change the command prefix the bot uses in your server.',
		COMMAND_PREFIX_REMINDER: (prefix: string): string => `The prefix for this guild is \`${prefix}\``,
		COMMAND_PREFIX_RESET: `Switched the guild's prefix back to \`${this.client.options.prefix}\``,
		COMMAND_PREFIX_CHANGED: (prefix: string): string => `The prefix for this guild has been set to \`${prefix}\``,
		COMMAND_EVAL_TIMEOUT: (seconds): string => `TIMEOUT: Took longer than ${seconds} seconds`,
		COMMAND_EVAL_OUTPUT_FILE: (time, type): string => `Sent the result as a file.\n**Type**:${type}\n${time}`,
		COMMAND_EVAL_OUTPUT_HASTEBIN: (time, url, type): string => `Sent the result to hastebin: ${url}\n**Type**:${type}\n${time}\n`,
		COMMAND_EVAL_OUTPUT_CONSOLE: (time, type): string => `Sent the result to console.\n**Type**:${type}\n${time}`,
		FUZZYSEARCH_MATCHES: (matches, codeblock): string => `I found multiple matches! **Please select a number within 0 and ${matches}**:\n${codeblock}\nWrite **ABORT** if you want to exit the prompt.`,
		FUZZYSEARCH_INVALID_NUMBER: 'I expected you to give me a (single digit) number, got a potato.',
		FUZZYSEARCH_INVALID_INDEX: 'That number was out of range, aborting prompt.',
		COMMAND_HELP_COMMAND_COUNT: (n): string => `${n} command${n === 1 ? '' : 's'}`,
		COMMAND_HELP_TITLE: (name, description): string => `📃 | ***Help Message*** | __**${name}**__\n${description}\n`,
		COMMAND_HELP_USAGE: (usage): string => `📝 | ***Command Usage***\n\`${usage}\`\n`,
		COMMAND_HELP_EXTENDED: (extendedHelp): string => `🔍 | ***Extended Help***\n${extendedHelp}`,
		COMMAND_HELP_ALL_FLAG: (prefix): string => `Displaying one category per page. Have issues with the embed? Run \`${prefix}help --all\` for a full list in DMs.`,
		COMMAND_HELP_DM: '📥 | The list of commands you have access to has been sent to your DMs.',
		COMMAND_HELP_NODM: '❌ | You have DMs disabled, I couldn\'t send you the commands in DMs.',
		USER_NOT_EXISTENT: 'This user does not exist. Are you sure you used a valid user ID?',
		COMMAND_CONF_MENU_NOPERMISSIONS: `I need the permissions ${PERMS.ADD_REACTIONS} and ${PERMS.MANAGE_MESSAGES} to be able to run the menu.`,
		COMMAND_CONF_MENU_RENDER_AT_FOLDER: (path): string => `Currently at: \\📁 ${path}`,
		COMMAND_CONF_MENU_RENDER_AT_PIECE: (path): string => `Currently at: ${path}`,
		COMMAND_CONF_MENU_RENDER_NOKEYS: 'There are no configurable keys for this folder',
		COMMAND_CONF_MENU_RENDER_SELECT: 'Please type in any of the following entries\' names',
		COMMAND_CONF_MENU_RENDER_TCTITLE: 'Text Commands:',
		COMMAND_CONF_MENU_RENDER_UPDATE: '• Update Value → `set <value>`',
		COMMAND_CONF_MENU_RENDER_REMOVE: '• Remove Value → `remove <value>`',
		COMMAND_CONF_MENU_RENDER_RESET: '• Reset Value → `reset`',
		COMMAND_CONF_MENU_RENDER_UNDO: '• Undo Update → `undo`',
		COMMAND_CONF_MENU_RENDER_CVALUE: (value): string => `Current Value: **\`\`${value}\`\`**`,
		COMMAND_CONF_MENU_RENDER_BACK: 'Press ◀ to go back',
		COMMAND_CONF_MENU_INVALID_KEY: 'Invalid Key, please try again with any of the following options.',
		COMMAND_CONF_MENU_INVALID_ACTION: 'Invalid Action, please try again with any of the following options.',
		COMMAND_CONF_MENU_SAVED: 'Successfully saved all changes.',
		SETTINGS_PREFIX: 'A prefix is an affix that is added in front of the word, in this case, the message. It allows bots to distinguish between a regular message and a command.',
		SETTINGS_LANGUAGE: 'The language I will use for your server. It may not be available in the language you want.',
		SETTINGS_DISABLEDCOMMANDS: 'The disabled commands, core commands may not be disabled, and moderators will override this. All commands must be in lower case.'
	};

	private helper: TranslationHelper = new TranslationHelper(this);

	public init(): Promise<void> {
		this.helper.setTranslations([
			['channel', 'channel'],
			['role', 'role'],
			['user', 'user']
		]);
		this.helper.setDefaults([
			['channel', 'channel'],
			['role', 'role'],
			['user', 'user']
		]);
		return super.init();
	}

	public toJSON(): PieceExtendedLanguageJSON {
		return { ...super.toJSON(), translations: this.helper.toJSON() };
	}

}
