// Copyright (c) 2019 kyranet. All rights reserved. Apache license.
// This is a recreation of work. The original work can be found here.
// https://github.com/kyranet/Skyra/blob/master/src/lib/util/FuzzySearch.ts
import { Collection, Message } from 'discord.js';
import { util } from 'klasa';
import { levenshtein } from './External/levenshtein';

type FuzzySearchAccess<V> = (value: V) => string;
type FuzzySearchFilter<V> = (value: V) => boolean;

export class FuzzySearch<K extends string, V> {

	private readonly collection: Collection<K, V>;
	private readonly access: FuzzySearchAccess<V>;
	private readonly filter: FuzzySearchFilter<V>;

	public constructor(collection: Collection<K, V>, access: FuzzySearchAccess<V>, filter: FuzzySearchFilter<V> = (): boolean => true) {
		this.collection = collection;
		this.access = access;
		this.filter = filter;
	}

	public run(message: Message, query: string, threshold = 5): Promise<[K, V, number] | null> {
		const lowcquery = query.toLowerCase();
		const results: [K, V, number][] = [];
		let lowerCaseName: string;
		let current: string;
		let distance: number;
		let almostExacts = 0;

		for (const [id, entry] of this.collection.entries()) {
			if (!this.filter(entry)) continue;

			current = this.access(entry);
			lowerCaseName = current.toLowerCase();

			if (lowerCaseName === lowcquery) {
				distance = 0;
			} else if (lowerCaseName.includes(lowcquery)) {
				distance = lowerCaseName.length - lowcquery.length;
			} else {
				distance = levenshtein(lowcquery, lowerCaseName);
			}

			// If the distance is bigger than the threshold, skip
			if (distance > threshold) continue;

			// Push the results
			results.push([id, entry, distance]);

			// Continue earlier
			if (distance <= 1) almostExacts++;
			if (almostExacts === 10) break;
		}

		if (!results.length) return Promise.resolve(null);

		const sorted = results.sort((a, b): number => a[2] - b[2]);

		const precision = sorted[0][2];
		if (precision < 2) {
			let i = 0;
			while (i < sorted.length && sorted[i][2] === precision) i++;
			return this.select(message, sorted.slice(0, i));
		}

		return this.select(message, sorted);
	}

	private async select(message: Message, results: [K, V, number][]): Promise<[K, V, number] | null> {
		if (results.length === 1) return results[0];
		if (results.length > 10) results.length = 10;


		const { content: n } = await message.prompt(message.language.get('FUZZYSEARCH_MATCHES', results.length - 1,
			util.codeBlock('http', results.map(([id, result], i) => `${i} : [ ${id.padEnd(18, ' ')} ] ${this.access(result)}`).join('\n'))));
		if (n.toLowerCase() === 'abort') return null;
		const parsed = Number(n);
		if (!Number.isSafeInteger(parsed)) throw message.language.get('FUZZYSEARCH_INVALID_NUMBER');
		if (parsed < 0 || parsed >= results.length) throw message.language.get('FUZZYSEARCH_INVALID_INDEX');
		return results[parsed];
	}

}
