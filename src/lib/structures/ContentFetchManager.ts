import { cdn, Fetch } from '../util/Cdn';
import { ClientManager } from './ClientManager';

export class ContentFetchManager {

	public readonly manager: ClientManager;

	public constructor(manager: ClientManager) {
		this.manager = manager;
	}

	public get cdn(): Fetch {
		return cdn();
	}

}
