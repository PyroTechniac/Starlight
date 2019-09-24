import { Language } from 'klasa';

export default class extends Language {

	public language: Record<string, string | string[] | ((...args: any[]) => string | string[])> = {
		RESOLVER_INVALID_MULTIPLE_ITEMS: (names: string): string => `Found multiple matches: \`${names}\`.`,
		RESOLVER_INVALID_NAME: (name: string, item: string): string => `${name} must be a valid ${item} name, ID, or mention.`,
		COMMAND_HEAPSNAPSHOT_DESCRIPTION: 'Creates a heapdump for finding memory leaks.',
		COMMAND_HEAPSNAPSHOT_EXTENDEDHELP: [
			'The heapsnapshot command is very useful for bots that have memory issues, it uses the heapdump library',
			'which freezes the entire process for a moment to analize all elements from the process\' HEAP, NEVER share',
			'heapsnapshot files with anybody, as everything your bot holds is included in that file.\n\nTo open heapsnapshot',
			'files, open Google Chrome, open Developer Tools, go to the tab Memory, and in Profiles, click on the buttom "load".',
			'Finally, open the profile and you will be given a table of all objects in your process, have fun!\n\nP.S:',
			'heapsnapshot files are as big as the amount of RAM you use, in big bots, the snapshots can freeze the bot',
			'much longer and the files can be much heavier.'
		].join(' ')
	};

}
