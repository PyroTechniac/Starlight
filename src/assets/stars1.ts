import { Asset } from '../lib/structures/Asset';

export default class extends Asset {

	public get filePath(): string {
		return Asset.makePath('stars', 'stars-1.png');
	}

	public get fileName(): string {
		return 'stars-1';
	}

}
