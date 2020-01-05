import { Extendable } from '../lib/util/Decorators';
import { Collector } from 'discord.js';

export default class CollectorExtendable<K, V> extends Extendable(Collector) {

	public *[Symbol.iterator](this: Collector<K, V>): IterableIterator<V> {
		yield *this.collected.values();
	}

}
