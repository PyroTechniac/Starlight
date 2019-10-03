import { Client as VezaClient } from 'veza';
import { KlasaClient } from 'klasa';

export class StarlightIPCClient extends VezaClient {

	public readonly client!: KlasaClient;
	public constructor(client: KlasaClient, name: string, ...args: any[]) {
		super(name, ...args);

		Object.defineProperty(this, 'client', { value: client });
	}

}
