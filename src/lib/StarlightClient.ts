import { Collection, VoiceRegion, User } from 'discord.js';
import * as Klasa from 'klasa';
import './StarlightPreload';
import { MemberGateway, WebhookStore, StarlightIterator } from './structures';

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

	public get ownersIter(): StarlightIterator<User> {
		return StarlightIterator.from(this.owners);
	}

	public async fetchVoiceRegions(): Promise<Collection<string, VoiceRegion>> {
		this.regions = await super.fetchVoiceRegions();
		return this.regions;
	}

	public awaitEvent(event: string): Promise<unknown> {
		return new Promise((resolve, reject): void => {
			/* eslint-disable @typescript-eslint/no-use-before-define */
			const eventListener = (...args: unknown[]): void => {
				if (errorListener !== undefined) {
					this.removeListener('error', errorListener);
				}
				resolve(args);
			};
			/* eslint-enable @typescript-eslint/no-use-before-define */
			let errorListener;

			if (event !== 'error') {
				errorListener = (err: unknown): void => {
					this.removeListener(event, eventListener);
					reject(err);
				};

				this.once('error', errorListener);
			}

			this.once(event, eventListener);
		});
	}

	public static defaultMemberSchema: Klasa.Schema = new Klasa.Schema();

	public static iter: typeof StarlightIterator = StarlightIterator;

	public static from<V>(iterator: Iterable<V> | Iterator<V>): StarlightIterator<V> {
		return StarlightIterator.from(iterator);
	}

}
