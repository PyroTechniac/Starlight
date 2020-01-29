import { Piece, PieceOptions } from 'klasa';
import { DocEntries } from './DocEntries';
import { DocsProviderStore } from './DocsProviderStore';

export abstract class DocsProvider extends Piece {

	public fetchURLs: string[];
	private entryMap: Map<string | RegExp, DocEntries> = new Map();

	public constructor(store: DocsProviderStore, file: string[], directory: string, options: DocsProviderOptions = {}) {
		super(store, file, directory, options);

		this.fetchURLs = options.fetch ?? [];
	}

	protected add(value: DocEntries): void {
		this.entryMap.set(value.name, value);
	}

}

export interface DocsProviderOptions extends PieceOptions {
	fetch?: string[];
}
