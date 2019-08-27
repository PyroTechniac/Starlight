import { Client, KlasaClientOptions } from 'klasa';
import { Collection, VoiceRegion } from 'discord.js';
import './StarlightPreload';

declare module 'discord.js' {
	interface Client {
		regions: null | Collection<string, VoiceRegion>;
	}
}

export class StarlightClient extends Client {

	public constructor(options: KlasaClientOptions = {}) {
		super(options);

		this.regions = null;
	}

	public async fetchVoiceRegions(): Promise<Collection<string, VoiceRegion>> {
		this.regions = await super.fetchVoiceRegions();
		return this.regions;
	}

}
