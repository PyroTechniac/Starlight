import { Extendable, ExtendableStore } from 'klasa';
import { Collector } from 'discord.js';


// This should not use the `ApplyOptions` decorator as TypeScript decorators break Extendables
export default class CollectorExtendable<K, V> extends Extendable {

	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Collector] });
	}

	public* [Symbol.iterator](this: Collector<K, V>): IterableIterator<V> {
		yield* this.collected.values();
	}

}
