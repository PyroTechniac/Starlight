import { Asset } from '../lib/structures/Asset';

export default class extends Asset {

	public get filepath(): string {
		return Asset.makePath('stars', 'stars-1.png');
	}

	public get filename(): string {
		return 'stars-1';
	}

}
