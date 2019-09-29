import { Collection, VoiceRegion, User } from 'discord.js';
import * as Klasa from 'klasa';
import './StarlightPreload';
import { MemberGateway } from './structures/MemberGateway';
import { WebhookStore } from './structures/WebhookStore';
import { StarlightIterator } from './structures/StarlightIterator';
import { ClientSettings } from './settings/ClientSettings';
import { once } from 'events';

export class StarlightClient extends Klasa.Client {

	public regions: Collection<string, VoiceRegion> | null = null;

	public constructor(options: Klasa.KlasaClientOptions = {}) {
		super(options);

		Reflect.defineMetadata('StarlightClient', true, this);

		const { members = {} } = this.options.gateways;
		members.schema = 'schema' in members ? members.schema : StarlightClient.defaultMemberSchema;
		this.gateways
			.register(new MemberGateway(this, 'members', members));

		this.webhooks = new WebhookStore(this);

	}

	public get owners(): Set<User> {
		if (!this.settings) return super.owners;

		const owners = super.owners;
		const ids = this.settings.get(ClientSettings.Owners) as ClientSettings.Owners;

		for (const id of ids) {
			const user = this.users.get(id);
			if (user) owners.add(user);
		}

		return owners;
	}

	public get ownersIter(): StarlightIterator<User> {
		return StarlightIterator.from(this.owners);
	}

	public async fetchVoiceRegions(): Promise<Collection<string, VoiceRegion>> {
		this.regions = await super.fetchVoiceRegions();
		return this.regions;
	}

	public waitFor(event: string): Promise<any[]> {
		return once(this, event);
	}

	public static defaultMemberSchema: Klasa.Schema = new Klasa.Schema();

	public static iter: typeof StarlightIterator = StarlightIterator;

	public static from<V>(iterator: Iterable<V> | Iterator<V>): StarlightIterator<V> {
		return StarlightIterator.from(iterator);
	}

}
