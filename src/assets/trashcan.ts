import { Asset } from '../lib/structures/Asset';

export default class extends Asset {

	public get fileName(): string {
		return 'trash-can';
	}

	public get filePath(): string {
		return Asset.makePath('icons', 'trash-can.png');
	}

}
