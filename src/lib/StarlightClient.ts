import { Collection, VoiceRegion, GuildMember } from 'discord.js';
import * as Klasa from 'klasa';
import './StarlightPreload';
import { MemberGateway } from './structures';

declare module 'discord.js' {
	interface Client {
		regions: null | Collection<string, VoiceRegion>;
		readonly members: Collection<string, GuildMember>;
		awaitEvent(event: string): Promise<unknown>;
	}

	interface GuildMember {
		settings: Klasa.Settings;
	}
}

export class StarlightClient extends Klasa.Client {

	public regions: Collection<string, VoiceRegion> | null = null;

	public constructor(options: Klasa.KlasaClientOptions = {}) {
		super(options);

		Reflect.defineMetadata('StarlightClient', true, this);

		const { members = {} } = this.options.gateways;
		members.schema = 'schema' in members ? members.schema : StarlightClient.defaultMemberSchema;
		this.gateways
			.register(new MemberGateway(this, 'members', members));

	}

	public async fetchVoiceRegions(): Promise<Collection<string, VoiceRegion>> {
		this.regions = await super.fetchVoiceRegions();
		return this.regions;
	}

	public get members(): Collection<string, GuildMember> {
		const coll = new Collection<string, GuildMember>();
		for (const guild of this.guilds.values()) {
			if (!guild.available) continue;
			for (const member of guild.members.values()) coll.set([guild.id, member.id].join('.'), member);
		}

		return coll;
	}

	public awaitEvent(event: string): Promise<unknown> {
		return new Promise((resolve, reject): void => {
			/* eslint-disable @typescript-eslint/no-use-before-define */
			const eventListener = (...args: any[]): void => {
				if (errorListener !== undefined) {
					this.removeListener('error', errorListener);
				}
				resolve(args);
			};
			/* eslint-enable @typescript-eslint/no-use-before-define */
			let errorListener;

			if (event !== 'error') {
				errorListener = (err: any): void => {
					this.removeListener(event, eventListener);
					reject(err);
				};

				this.once('error', errorListener);
			}

			this.once(event, eventListener);
		});
	}

	public static defaultMemberSchema: Klasa.Schema = new Klasa.Schema();

}
