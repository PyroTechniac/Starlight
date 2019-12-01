import { mergeDefault } from '@klasa/utils';
import * as Klasa from 'klasa';
import { Client } from 'klasa-dashboard-hooks';
import { config } from 'dotenv';
import './extensions/StarlightGuild';
import './extensions/StarlightMessage';
import 'reflect-metadata';
import './setup/PermissionLevels';
import './schemas/Clients';
import './schemas/Guilds';
import './schemas/Users';
import { STARLIGHT_OPTIONS } from './util/Constants';
import { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { ResolverStore } from './structures/ResolverStore';
import { ClientCache } from './util/cache/ClientCache';
import { UserCache } from './util/cache/UserCache';
import { ClientManager } from './structures/ClientManager';
import { Fetch } from './util/Cdn';

config();

export class StarlightClient extends Klasa.Client {

	public llrcs: Set<LongLivingReactionCollector> = new Set();

	public manager: ClientManager = new ClientManager(this);

	public constructor(options: Klasa.KlasaClientOptions = {}) {
		super(mergeDefault(STARLIGHT_OPTIONS, options));

		Reflect.defineMetadata('StarlightClient', true, this);

		this.resolvers = new ResolverStore(this);
		this.registerStore(this.resolvers);

	}

	public get cache(): ClientCache {
		return this.manager.cache;
	}

	public get cdn(): Fetch {
		return this.manager.cdn;
	}

	public get userCache(): UserCache {
		return this.cache.users;
	}

}

StarlightClient.use(Client);
