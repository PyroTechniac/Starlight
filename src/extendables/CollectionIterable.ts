import { Extendable, ExtendableOptions } from 'klasa';
import { StarlightIterator, ApplyOptions } from '../lib';
import { default as Collection } from '@discordjs/collection';

@ApplyOptions<ExtendableOptions>({
	appliesTo: [Collection]
})
export default class extends Extendable {

	public iter<K, V>(this: Collection<K, V>): StarlightIterator<V> {
		return StarlightIterator.from(this.values());
	}

	public iterKeys<K, V>(this: Collection<K, V>): StarlightIterator<K> {
		return StarlightIterator.from(this.keys());
	}

	public iterEntries<K, V>(this: Collection<K, V>): StarlightIterator<[K, V]> {
		return StarlightIterator.from(this.entries());
	}

}
