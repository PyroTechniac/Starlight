import { mergeDefault } from '@klasa/utils';
import * as Klasa from 'klasa';
import { Client } from 'klasa-dashboard-hooks';
import { config } from 'dotenv';
import './extensions/StarlightGuild';
import './extensions/StarlightChannels';
import './extensions/StarlightMessage';
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
import { ResolverStore } from './structures/ResolverStore';
import { ClientCache } from './util/cache/ClientCache';
import { UserCache } from './util/cache/UserCache';
import { ClientManager } from './structures/ClientManager';
import { Fetch } from './util/Cdn';
import { ChannelGateway } from './structures/ChannelGateway';
import { ChannelGatewaysTypes } from './types/Enums';
import { MemberGateway } from './structures/MemberGateway';

config();

export class StarlightClient extends Klasa.Client {

	public llrcs: Set<LongLivingReactionCollector> = new Set();

	public manager: ClientManager = new ClientManager(this);

	public constructor(options: Klasa.KlasaClientOptions = {}) {
		super(mergeDefault(STARLIGHT_OPTIONS, options));

		Reflect.defineMetadata('StarlightClient', true, this);

		this.resolvers = new ResolverStore(this);
		this.registerStore(this.resolvers);

		this._registerGateways();

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

	private _registerGateways(): void {
		const { guilds = {}, users = {}, clientStorage = {} } = this.options.settings.gateways!;
		guilds.schema = 'schema' in guilds ? guilds.schema! : Client.defaultGuildSchema;
		users.schema = 'schema' in users ? users.schema! : Client.defaultUserSchema;
		clientStorage.schema = 'schema' in clientStorage ? clientStorage.schema! : Client.defaultClientSchema;

		const prefix = guilds.schema.get('prefix') as Klasa.SchemaEntry | undefined;
		const language = guilds.schema.get('language') as Klasa.SchemaEntry | undefined;

		if (!prefix || prefix.default === null) {
			guilds.schema.add('prefix', 'string', { 'array': Array.isArray(this.options.prefix), 'default': this.options.prefix });
		}

		if (!language || language.default === null) {
			guilds.schema.add('language', 'language', { 'default': this.options.language });
		}

		guilds.schema.add('disableNaturalPrefix', 'boolean', { configurable: Boolean(this.options.regexPrefix) });

		this.gateways
			.register(new Klasa.Gateway(this, 'guilds', guilds))
			.register(new Klasa.Gateway(this, 'users', users))
			.register(new Klasa.Gateway(this, 'clientStorage', clientStorage))
			.register(new ChannelGateway(this, ChannelGatewaysTypes.Text, { schema: TextSchema }))
			.register(new ChannelGateway(this, ChannelGatewaysTypes.Voice, { schema: VoiceSchema }))
			.register(new ChannelGateway(this, ChannelGatewaysTypes.Category, { schema: CategorySchema }))
			.register(new MemberGateway(this, 'members', { schema: MemberSchema }));

	}

}

StarlightClient.use(Client);
