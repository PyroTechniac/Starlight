import { mergeDefault } from './util/Utils';
import * as Klasa from 'klasa';
import { Client } from 'klasa-dashboard-hooks';
import { config } from 'dotenv';
import './extensions/StarlightGuild';
import './extensions/StarlightChannels';
import './extensions/StarlightMessage';
import './extensions/StarlightGuildMember';
import './extensions/StarlightUser';
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
import { ClientCacheManager } from './util/cache/ClientCacheManager';
import { UserCache } from './util/cache/UserCache';
import { ClientManager } from './structures/ClientManager';
import { ChannelGateway } from './structures/ChannelGateway';
import { Databases } from './types/Enums';
import { MemberGateway } from './structures/MemberGateway';
import { FetchApi } from './structures/ContentFetchManager';
import { Resolver } from './structures/Resolver';
import { FSWatcher } from 'chokidar';

config();

export class StarlightClient extends Klasa.Client {

	public llrcs: Set<LongLivingReactionCollector> = new Set();

	public manager: ClientManager = new ClientManager(this);

	public resolver: Resolver = new Resolver(this);

	public fsWatcher: FSWatcher | null = null;

	public constructor(options: Klasa.KlasaClientOptions = {}) {
		super(mergeDefault(STARLIGHT_OPTIONS, options));

		this._registerGateways();

	}

	public get cache(): ClientCacheManager {
		return this.manager.cache;
	}

	public get cdn(): FetchApi {
		return this.manager.cdn;
	}

	public get userCache(): UserCache {
		return this.cache.users;
	}

	private _registerGateways(): void {
		this.gateways
			.register(new ChannelGateway(this, Databases.Texts, { schema: TextSchema }))
			.register(new ChannelGateway(this, Databases.Voices, { schema: VoiceSchema }))
			.register(new ChannelGateway(this, Databases.Categories, { schema: CategorySchema }))
			.register(new MemberGateway(this, Databases.Members, { schema: MemberSchema }));

	}

}

StarlightClient.use(Client);
