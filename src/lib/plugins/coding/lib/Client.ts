import { KlasaClient, KlasaClientOptions } from 'klasa';
import { join } from 'path';

export class CanvasClient extends KlasaClient {

	public constructor(options?: KlasaClientOptions) {
		super(options);
		// @ts-ignore
		this.constructor[KlasaClient.plugin].call(this);
	}

	public static [KlasaClient.plugin](this: CanvasClient) {
		const coreDirectory = join(__dirname, '..', '/');

		// @ts-ignore
		this.commands.registerCoreDirectory(coreDirectory);
	}

}
