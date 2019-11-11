import { Client, Store } from 'klasa';
import { Asset } from './Asset';

export class AssetStore extends Store<string, Asset, typeof Asset> {

	public constructor(client: Client) {
		super(client, 'assets', Asset);
	}

}
