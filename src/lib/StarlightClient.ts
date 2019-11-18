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
import { ContentDeliveryNetwork } from './structures/ContentDeliveryNetwork';
import { STARLIGHT_OPTIONS } from './util/Constants';
import { LongLivingReactionCollector } from './util/LongLivingReactionCollector';
import { ResolverStore } from './structures/ResolverStore';
import { CacheManager } from './util/cache/CacheManager';
import { UserCache } from './util/cache/UserCache';

config();

export class StarlightClient extends Klasa.Client {

	public llrcs: Set<LongLivingReactionCollector> = new Set();

	public constructor(options: Klasa.KlasaClientOptions = {}) {
		super(mergeDefault(STARLIGHT_OPTIONS, options));

		Reflect.defineMetadata('StarlightClient', true, this);

		this.resolvers = new ResolverStore(this);
		this.registerStore(this.resolvers);

		this.cache = new CacheManager(this);

		this.cdn = new ContentDeliveryNetwork(this);

	}

	public get userCache(): UserCache {
		return this.cache.users;
	}

}

StarlightClient.use(Client);
