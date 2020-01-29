import { KlasaClient, Store } from 'klasa';
import { DocsProvider } from './DocsProvider';

export class DocsProviderStore extends Store<string, DocsProvider> {

	public constructor(client: KlasaClient, coreDirectory: string) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		super(client, 'docsProviders', DocsProvider);

		this.registerCoreDirectory(coreDirectory);
	}

}
