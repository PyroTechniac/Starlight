import * as Discord from 'discord.js';
import { once } from 'events';
import * as Klasa from 'klasa';
import { Client } from 'klasa-dashboard-hooks';
import { ClientSettings } from './settings/ClientSettings';
import './StarlightPreload';
import { ContentDeliveryNetwork } from './structures/ContentDeliveryNetwork';
import { WebhookStore } from './structures/WebhookStore';
import { CachedClass } from './types/Interfaces';
import { STARLIGHT_OPTIONS } from './util/Constants';
import { Cacheable } from './util/Decorators';

@Cacheable
export class StarlightClient extends Klasa.Client {

	public regions: Discord.Collection<string, Discord.VoiceRegion> | null = null;

	public constructor(options: Klasa.KlasaClientOptions = {}) {
		super(Klasa.util.mergeDefault(STARLIGHT_OPTIONS, options));

		Reflect.defineMetadata('StarlightClient', true, this);

		this.cdn = new ContentDeliveryNetwork(this);

		this.webhooks = new WebhookStore(this);
	}

	public get owners(): Set<Discord.User> {
		if (!this.settings) return super.owners;

		const owners = super.owners;
		const ids = this.settings.get(ClientSettings.Owners);

		for (const id of ids) {
			const user = this.users.get(id);
			if (user) owners.add(user);
		}

		return owners;
	}

	public async fetchVoiceRegions(): Promise<Discord.Collection<string, Discord.VoiceRegion>> {
		this.regions = await super.fetchVoiceRegions();
		return this.regions;
	}

	public waitFor(event: string): Promise<any[]> {
		return once(this, event);
	}

}

export interface StarlightClient extends CachedClass {}

StarlightClient.use(Client);
