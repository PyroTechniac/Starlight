import * as Discord from 'discord.js';
import * as Klasa from 'klasa';
import { Client } from 'klasa-dashboard-hooks';
import './StarlightPreload';
import { ContentDeliveryNetwork } from './structures/ContentDeliveryNetwork';
import { STARLIGHT_OPTIONS } from './util/Constants';

export class StarlightClient extends Klasa.Client {

	public regions: Discord.Collection<string, Discord.VoiceRegion> | null = null;

	public usertags: Discord.Collection<string, string> = new Discord.Collection();

	public constructor(options: Klasa.KlasaClientOptions = {}) {
		super(Klasa.util.mergeDefault(STARLIGHT_OPTIONS, options));

		Reflect.defineMetadata('StarlightClient', true, this);

		this.cdn = new ContentDeliveryNetwork(this);
	}

	public async fetchTag(id: string): Promise<string> {
		const cache = this.usertags.get(id);
		if (cache) return cache;

		const user = await this.users.fetch(id);
		this.usertags.set(user.id, user.tag);
		return user.tag;
	}

	public async fetchUsername(id: string): Promise<string> {
		const tag = await this.fetchTag(id);
		return tag.slice(0, tag.indexOf('#'));
	}

}

StarlightClient.use(Client);
