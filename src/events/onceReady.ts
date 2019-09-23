import { Event, EventOptions, util } from 'klasa';
import { Team } from 'discord.js';
import { ApplyOptions, Events, filterArray, StarlightTypeError, ERROR_WEBHOOK_DATA, STATS_WEBHOOK_DATA, APIWebhookData } from '../lib';
let retries = 0;

const webhooks: [string, APIWebhookData][] = [
	['error', ERROR_WEBHOOK_DATA],
	['stats', STATS_WEBHOOK_DATA]
];

@ApplyOptions<EventOptions>({
	event: 'ready',
	once: true
})
export default class extends Event {

	public async run(): Promise<boolean> {
		try {
			await Promise.all([
				this.client.fetchVoiceRegions(),
				this.client.fetchApplication()
			]);
		} catch (err) {
			if (++retries === 3) return process.exit();
			this.client.emit(Events.Warning, `Unable to fetchVoiceRegions/fetchApplication at this time, waiting 5 seconds and retrying. Retries left: ${retries - 3}`);
			return util.sleep(5000).then(this.run);
		}

		webhooks.forEach(this.client.webhooks.add.bind(this.client.webhooks));

		this.client.options.owners = Array.from(this.resolveOwners());

		this.client.mentionPrefix = new RegExp(`^<@!?${this.client.user!.id}>`);

		const clientStorage = this.client.gateways.get('clientStorage')!;
		// @ts-ignore
		clientStorage.cache.set(this.client.user!.id, this.client);
		this.client.settings = clientStorage.create(this.client, this.client.user!.id);

		await this.client.gateways.sync();

		await this.client.schedule.init();


		const initializing = this.client.pieceStores
			.filter((store): boolean => !['extendables', 'providers'].includes(store.name))
			.map((store): Promise<void> => store.init());

		await Promise.all(initializing);

		// @ts-ignore
		util.initClean(this.client);
		this.client.ready = true;

		if (this.client.options.readyMessage !== null) {
			this.client.emit(Events.Log, util.isFunction(this.client.options.readyMessage)
				? this.client.options.readyMessage(this.client)
				: this.client.options.readyMessage);
		}

		return this.client.emit(Events.KlasaReady);
	}

	private resolveOwners(): string[] {
		const owners: string[] = [];

		const { owner } = this.client.application;
		if (owner === null) throw new StarlightTypeError('EXPECTED_FOUND').init('a Team or User', owner);
		if (owner instanceof Team) {
			owners.push(...owner.members.keys());
		} else {
			owners.push(owner.id);
		}

		if (this.client.options.owners.length) owners.push(...this.client.options.owners);

		return filterArray(...owners);
	}

}
