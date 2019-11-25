import { Language, version as klasaVersion } from 'klasa';
import { PERMS } from '../lib/util/Constants';
import { LanguageHelp } from '../lib/util/LanguageHelp';

const builder = new LanguageHelp()
	.setExplainedUsage('⚙ | ***Explained usage***')
	.setPossibleFormats('🔢 | ***Possible formats***')
	.setExamples('🔗 | ***Examples***')
	.setReminder('⏰ | ***Reminder***');

export default class extends Language {

	public language: Record<string, string | string[] | ((...args: any[]) => string | string[])> = {
		COMMAND_HEAPSNAPSHOT_DESCRIPTION: 'Creates a heapdump for finding memory leaks.',
		COMMAND_HEAPSNAPSHOT_EXTENDEDHELP: builder.display('heapsnapshot', {
			extendedHelp: [
				'The heapsnapshot command is very useful for bots that have memory issues, it uses the heapdump library',
				'which freezes the entire process for a moment to analize all elements from the process\' HEAP, NEVER share',
				'heapsnapshot files with anybody, as everything your bot holds is included in that file.\n\nTo open heapsnapshot',
				'files, open Google Chrome, open Developer Tools, go to the tab Memory, and in Profiles, click on the buttom "load".',
				'Finally, open the profile and you will be given a table of all objects in your process, have fun!\n\nP.S:',
				'heapsnapshot files are as big as the amount of RAM you use, in big bots, the snapshots can freeze the bot',
				'much longer and the files can be much heavier.'
			].join(' ')
		}),
		COMMAND_EXEC_AWAITING: 'Executing your command...',
		COMMAND_EXEC_NO_OUTPUT: 'Done. There was no output to stdout or stderr.',
		COMMAND_HEAPSNAPSHOT_CAPTURING: (used: string): string => `Capturing HEAP Snapshot, this may take a while. RAM Usage: ${used} MB`,
		COMMAND_HEAPSNAPSHOT_CAPTURED: (path: string): string => `Captured in \`${path}\`, check! Remember, do NOT share this with anybody, it may contain a lot of sensitive data.`,
		COMMAND_SUBREDDIT_DESCRIPTION: 'Returns information on a subreddit.',
		COMMAND_SUBREDDIT_ERROR: 'There was an error. Reddit may be down, or the subreddit doesn\'t exist.',
		COMMAND_SUBREDDIT_NOEXIST: 'That subreddit doesn\'t exist.',
		SYSTEM_LOADING: 'Loading data...',
		COMMAND_PREFIX_DESCRIPTION: 'Change the command prefix the bot uses in your server.',
		COMMAND_PREFIX_REMINDER: (prefix: string): string => `The prefix for this guild is \`${prefix}\``,
		COMMAND_PREFIX_RESET: `Switched the guild's prefix back to \`${this.client.options.prefix}\``,
		COMMAND_PREFIX_CHANGED: (prefix: string): string => `The prefix for this guild has been set to \`${prefix}\``,
		COMMAND_EVAL_DESCRIPTION: 'Evaluates arbitrary JavaScript. Reserved for bot owner.',
		COMMAND_EVAL_EXTENDED: builder.display('eval', {
			extendedHelp: `The eval command evaluates code as-in, any error thrown from it will be handled.
					It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.
					The --wait flag changes the time the eval will run. Defaults to 10 seconds. Accepts time in milliseconds.
					The --output and --output-to flag accept either 'file', 'log', 'haste' or 'hastebin'.
					The --delete flag makes the command delete the message that executed the message after evaluation.
					The --silent flag will make it output nothing.
					The --depth flag accepts a number, for example, --depth=2, to customize util.inspect's depth.
					The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword
					The --showHidden flag will enable the showHidden option in util.inspect.
					The --lang and --language flags allow different syntax highlight for the output.
					The --json flag converts the output to json
					The --no-timeout flag disables the timeout
					If the output is too large, it'll send the output as a file, or in the console if the bot does not have the ${PERMS.ATTACH_FILES} permission.`,
			examples: [
				'msg.author!.username;',
				'1 + 1;'
			]
		}, true),
		COMMAND_TAG_DESCRIPTION: 'Manage this guilds\' tags.',
		COMMAND_TAG_EXTENDED: builder.display('tag', {
			extendedHelp: `What are tags? Tags are chunk of texts stored under a name, which allows you, for example,
					you can do \`Skyra, tag rule1\` and get a response with what the rule number one of your server is.
					Besides that, tags are also used for memes, who doesn't like memes?`,
			explainedUsage: [
				['action', 'The action to perform: **add** to add new tags, **remove** to delete them, and **edit** to edit them.'],
				['tag', 'The tag\'s name.'],
				['contents', 'Required for the actions **add** and **edit**, specifies the content for the tag.']
			],
			examples: [
				'add rule1 Respect other users. Harassment, hatespeech, etc... will not be tolerated.',
				'edit rule1 Just be respectful with the others.',
				'rule1',
				'source rule1',
				'remove rule1',
				'list'
			]
		}),
		COMMAND_TAG_PERMISSIONLEVEL: 'You must be a staff member, moderator, or admin, to be able to manage tags.',
		COMMAND_TAG_NAME_NOTALLOWED: 'A tag name may not have a grave accent nor invisible characters.',
		COMMAND_TAG_NAME_TOOLONG: 'A tag name must be 50 or less characters long.',
		COMMAND_TAG_EXISTS: tag => `The tag '${tag}' already exists.`,
		COMMAND_TAG_CONTENT_REQUIRED: 'You must provide a content for this tag.',
		COMMAND_TAG_ADDED: (name, content): string => `Successfully added a new tag: **${name}** with a content of **${content}**.`,
		COMMAND_TAG_REMOVED: (name): string => `Successfully removed the tag **${name}**.`,
		COMMAND_TAG_NOTEXISTS: (tag): string => `The tag '${tag}' does not exist.`,
		COMMAND_TAG_EDITED: (name, content): string => `Successfully edited the tag **${name}** with a content of **${content}**.`,
		COMMAND_TAG_LIST_EMPTY: 'The tag list for this server is empty.',
		COMMAND_TAG_LIST: (tags): string => `${(tags.length === 1 ? 'There is 1 tag: ' : `There are ${tags.length} tags: `)}${tags.join(', ')}`,
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
		SETTINGS_DISABLEDCOMMANDS: 'The disabled commands, core commands may not be disabled, and moderators will override this. All commands must be in lower case.',
		COMMAND_EXEC_DESCRIPTION: 'Execute commands in the terminal, use with EXTREME CAUTION',
		COMMAND_EXEC_EXTENDED: builder.display('exec', {
			extendedHelp: 'Times out in 60 seconds by default. This can be changed with --timeout=TIME_IN_MILLISECONDS'
		}),
		RESOLVER_INVALID_CHANNELNAME: (name): string => `${name} must be a valid channel name, ID, or tag.`,
		RESOLVER_INVALID_USERNAME: (name): string => `${name} must be a valid user name, ID, or mention.`,
		RESOLVER_INVALID_ROLENAME: (name): string => `${name} must be a valid role name, ID, or mention.`,
		COMMAND_STATS_DESCRIPTION: 'Provides some details about the bot and stats.',
		COMMAND_STATS_EXTENDED: builder.display('stats', {
			extendedHelp: 'This should be very obvious...'
		}),
		COMMAND_STATS: (STATS, UPTIME, USAGE): string => [
			'= STATISTICS =',
			`• Users      :: ${STATS.USERS}`,
			`• Guilds     :: ${STATS.GUILDS}`,
			`• Channels   :: ${STATS.CHANNELS}`,
			`• Discord.js :: ${STATS.VERSION}`,
			`• Node.js    :: ${STATS.NODE_JS}`,
			`• Klasa      :: ${klasaVersion}`,
			'',
			'= UPTIME =',
			`• Host       :: ${UPTIME.HOST}`,
			`• Total      :: ${UPTIME.TOTAL}`,
			`• Client     :: ${UPTIME.CLIENT}`,
			'',
			'= HOST USAGE =',
			`• CPU Load   :: ${USAGE.CPU_LOAD}`,
			`• RAM +Node  :: ${USAGE.RAM_TOTAL}`,
			`• RAM Usage  :: ${USAGE.RAM_USED}`
		].join('\n'),
		RESOLVER_INVALID_PERMISSIONS: (): string => 'Could not resolve the provided argument to a Permissions'
	};

}
