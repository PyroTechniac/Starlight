import { ArrayValues } from '../../types/Types';
import { BaseEntry } from './base/BaseEntry';
import { generateRegExp } from '../../util/Utils';
import { levenshtein } from '../../util/External/levenshtein';

const possibles = [
	'props',
	'staticProps',
	'methods',
	'events',
	'externals'
] as const;

type PossibleType = ArrayValues<typeof possibles>;

type DocEntriesMap = Map<string | RegExp, BaseEntry>;

export class DocEntries {

	public props: DocEntriesMap = new Map();
	public staticProps: DocEntriesMap = new Map();
	public methods: DocEntriesMap = new Map();
	public events: DocEntriesMap = new Map();
	public externals: DocEntriesMap = new Map();

	public constructor(public readonly name: string, public readonly baseURL: string) {
	}

	public get(search: string): BaseEntry {
		const searchInput = search.trim().toLowerCase();
		const possibleMatches: BaseEntry[] = [];

		for (const possible of possibles) {
			const map = this[possible];
			for (const [key, value] of map) {
				if (typeof key === 'string') {
					if (searchInput === key.toLowerCase()) return value;
					if (levenshtein(searchInput, key.toLowerCase(), true) <= 3) possibleMatches.push(value);
				} else if (key.test(searchInput)) {
					return value;
				}
			}
		}


		if (possibleMatches.length) throw `Multiple matches found for \`${searchInput}\` — Be more specific\n\`${possibleMatches.map((value, index) => `${index + 1}: ${value.name}`).join('`\n`')}\``;

		throw `Couldn't find anything for ${searchInput}`;

	}

	public add(type: PossibleType, value: BaseEntry): void {
		const map = this[type];
		map.set(value.name, value);
		map.set(new RegExp(String.raw`\b(?:${generateRegExp(value.name)})\b`, 'i'), value);
	}

}
