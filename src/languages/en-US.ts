import { Language } from 'klasa';
import { TranslationHelper } from '../lib/structures/TranslationHelper';
import { PieceExtendedLanguageJSON } from '../lib/types/Interfaces';

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
		SYSTEM_LOADING: 'Loading data...'
	};

	private helper: TranslationHelper = new TranslationHelper(this);

	public init(): Promise<void> {
		this.helper.setTranslations([
			['channel', 'channel']
		]);
		this.helper.setDefaults([
			['channel', 'channel']
		]);
		return super.init();
	}

	public toJSON(): PieceExtendedLanguageJSON {
		return { ...super.toJSON(), translations: this.helper.toJSON() };
	}

}
