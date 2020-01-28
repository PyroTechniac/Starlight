import { mergeDefault } from './util/Utils';
import * as Klasa from 'klasa';
import { Client } from 'klasa-dashboard-hooks';
import { config } from 'dotenv';
import './extensions/StarlightGuild';
import './extensions/StarlightChannels';
import './extensions/StarlightGuildMember';
import 'reflect-metadata';
import './setup/PermissionLevels';
import './schemas/Clients';
import './schemas/Guilds';
import './schemas/Users';
import TextSchema from './schemas/Texts';
import CategorySchema from './schemas/Categories';
import VoiceSchema from './schemas/Voices';
import MemberSchema from './schemas/Members';
import { STARLIGHT_OPTIONS } from './util/Constants';
import { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { ClientEngine } from './structures/ClientEngine';
import { ChannelGateway } from './structures/ChannelGateway';
import { Databases } from './types/Enums';
import { MemberGateway } from './structures/MemberGateway';
import { FetchApi } from './structures/ContentFetchEngine';
import { Resolver } from './structures/Resolver';
import { FSWatcher } from 'chokidar';
import { join } from 'path';
import { AssetStore } from './structures/AssetStore';
import { SchemaEngine } from './structures/SchemaEngine';

config();

export class StarlightClient extends Klasa.Client {

	public llrcs: Set<LongLivingReactionCollector> = new Set();

	public engine: ClientEngine = new ClientEngine(this);

	public resolver: Resolver = new Resolver(this);

	public fsWatcher: FSWatcher | null = null;

	public constructor(options: Klasa.KlasaClientOptions = {}) {
		super(mergeDefault(STARLIGHT_OPTIONS, options));

		this.assets = new AssetStore(this, join(__dirname, '..', '/'));

		this.registerStore(this.assets);

		this._registerGateways();

	}

	public get cdn(): FetchApi {
		return this.engine.cdn;
	}

	public get schemas(): SchemaEngine {
		return this.engine.schemas;
	}

	private _registerGateways(): this {
		this.gateways
			.register(new ChannelGateway(this, Databases.Texts, { schema: TextSchema }))
			.register(new ChannelGateway(this, Databases.Voices, { schema: VoiceSchema }))
			.register(new ChannelGateway(this, Databases.Categories, { schema: CategorySchema }))
			.register(new MemberGateway(this, Databases.Members, { schema: MemberSchema }));

		return this;
	}

}

StarlightClient.use(Client);
