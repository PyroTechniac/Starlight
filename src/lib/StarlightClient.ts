import * as Discord from 'discord.js';
import { once } from 'events';
import * as Klasa from 'klasa';
import { ClientSettings } from './settings/ClientSettings';
import './StarlightPreload';
import { IPCMonitorStore } from './structures/IPCMonitorStore';
import { MemberGateway } from './structures/MemberGateway';
import { StarlightIPCClient } from './structures/StarlightIPCClient';
import { StarlightIterator } from './structures/StarlightIterator';
import { WebhookStore } from './structures/WebhookStore';
import { Events } from './types/Enums';

const g = new Klasa.Colors({ text: 'green' }).format('[IPC   ]');
const y = new Klasa.Colors({ text: 'yellow' }).format('[IPC   ]');
const r = new Klasa.Colors({ text: 'red' }).format('[IPC   ]');


export class StarlightClient extends Klasa.Client {

	public regions: Discord.Collection<string, Discord.VoiceRegion> | null = null;

	public constructor(options: Klasa.KlasaClientOptions = {}) {
		super(options);

		Reflect.defineMetadata('StarlightClient', true, this);

		this.ipcMonitors = new IPCMonitorStore(this);
		this.registerStore(this.ipcMonitors);

		this.ipc = new StarlightIPCClient(this, 'starlight-master')
			.on('disconnect', (client): void => { this.emit(Events.Warn, `${y} Disconnected: ${client.name}`); })
			.on('ready', (client): void => { this.emit(Events.Verbose, `${g} Ready: ${client.name}`); })
			.on('error', (error, client): void => { this.emit(Events.Error, `${r} Error from ${client.name}`, error); })
			.on('message', this.ipcMonitors.run.bind(this.ipcMonitors));


		const { members = {} } = this.options.gateways;
		members.schema = 'schema' in members ? members.schema : StarlightClient.defaultMemberSchema;
		this.gateways
			.register(new MemberGateway(this, 'members', members));

		this.webhooks = new WebhookStore(this);
	}

	public get owners(): Set<Discord.User> {
		if (!this.settings) return super.owners;

		const owners = super.owners;
		const ids = this.settings.get(ClientSettings.Owners) as ClientSettings.Owners;

		for (const id of ids) {
			const user = this.users.get(id);
			if (user) owners.add(user);
		}

		return owners;
	}

	public get ownersIter(): StarlightIterator<Discord.User> {
		return StarlightIterator.from(this.owners);
	}

	public async fetchVoiceRegions(): Promise<Discord.Collection<string, Discord.VoiceRegion>> {
		this.regions = await super.fetchVoiceRegions();
		return this.regions;
	}

	public async login(token?: string): Promise<string> {
		this.ipc.connected = await this.ipc.connectTo(7827)
			.then(() => true)
			.catch(() => false);
		return super.login(token);
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
