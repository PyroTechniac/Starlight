import { Client, KlasaClientOptions, Settings, Schema } from 'klasa';
import { Collection, VoiceRegion } from 'discord.js';
import { MemberGateway } from './structures';
import './StarlightPreload';

declare module 'discord.js' {
	interface Client {
		regions: null | Collection<string, VoiceRegion>;
	}

	interface GuildMember {
		settings: Settings;
	}
}

export class StarlightClient extends Client {

	public regions: Collection<string, VoiceRegion> | null = null;

	public constructor(options: KlasaClientOptions = {}) {
		super(options);

		const { members = {} } = this.options.gateways;
		members.schema = 'schema' in members ? members.schema : StarlightClient.defaultMemberSchema;
		this.gateways
			.register(new MemberGateway(this, 'members', members));
	}

	public async fetchVoiceRegions(): Promise<Collection<string, VoiceRegion>> {
		this.regions = await super.fetchVoiceRegions();
		return this.regions;
	}

	public static defaultMemberSchema: Schema = new Schema();

}
