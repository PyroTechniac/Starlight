import { Language } from 'klasa';

export default class extends Language {

	public language: Record<string, string | string[] | ((...args: any[]) => string | string[])> = {
		RESOLVER_INVALID_MULTIPLE_ITEMS: (names: string): string => `Found multiple matches: \`${names}\`.`,
		RESOLVER_INVALID_NAME: (name: string, item: string): string => `${name} must be a valid ${item} name, ID, or mention.`
	};

}
