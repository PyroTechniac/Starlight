import { Asset } from '../lib/structures/Asset';

export default class extends Asset {

	public get filename(): string {
		return 'trash-can.png';
	}

	public get filepath(): string {
		return Asset.makePath('icons', 'trash-can.png');
	}

}
