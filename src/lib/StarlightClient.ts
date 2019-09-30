import { Collection, User, VoiceRegion } from 'discord.js';
import { once } from 'events';
import * as Klasa from 'klasa';
import { Client as VezaClient } from 'veza';
import { ClientSettings } from './settings/ClientSettings';
import './StarlightPreload';
import { MemberGateway } from './structures/MemberGateway';
import { NodeMonitorStore } from './structures/NodeMonitorStore';
import { StarlightIterator } from './structures/StarlightIterator';
import { WebhookStore } from './structures/WebhookStore';
import { Events } from './types/Enums';

const [green, yellow, red] = ['green', 'yellow', 'red'].map((text) => new Klasa.Colors({ text }).format('[IPC   ]'));

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

		this.nodeMonitors = new NodeMonitorStore(this);

		this.node = new VezaClient('starlight-master')
			.on('disconnect', (client): void => { this.emit(Events.Warn, `${yellow} Disconnected: ${client.name}`) })
			.on('ready', (client): void => { this.emit(Events.Verbose, `${green} Ready ${client.name}`) })
			.on('error', (error, client) => { this.emit(Events.Error, `${red} Error from ${client.name}`, error) })
			.on('message', this.nodeMonitors.run.bind(this.nodeMonitors));

		this.registerStore(this.nodeMonitors);
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

	public async login(token?: string): Promise<string> {
		await this.node.connectTo(7827)
			.then((): void => this.console.debug('Successfully connected to backend'))
			.catch((e): void => this.console.debug(`Failed to connect to Starlight Backend: ${e}`));
		return super.login(token);
	}

	public static defaultMemberSchema: Klasa.Schema = new Klasa.Schema();

	public static iter: typeof StarlightIterator = StarlightIterator;

	public static from<V>(iterator: Iterable<V> | Iterator<V>): StarlightIterator<V> {
		return StarlightIterator.from(iterator);
	}

}
