import { Asset } from '../lib/structures/Asset';

export default class extends Asset {
	public get filename(): string {
		return 'klasa-icon.png';
	}

	public get filepath(): string {
		return Asset.makePath('icons', 'klasa.png');
	}
}
