import { KlasaClient, Store } from 'klasa';
import { Asset } from './Asset';

export class AssetStore extends Store<string, Asset, typeof Asset> {

	public constructor(client: KlasaClient, coreDir: string) {
		super(client, 'assets', Asset);

		this.registerCoreDirectory(coreDir);
	}

}
