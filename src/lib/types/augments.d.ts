import { CustomGet } from '../settings/Shared';
import { LongLivingReactionCollector } from '../util/LongLivingReactionCollector';
import { ResolverStore } from '../structures/ResolverStore';
import { ClientCache } from '../util/cache/ClientCache';
import { UserCache } from '../util/cache/UserCache';
import { MemberTags } from '../util/cache/MemberTags';
import { FetchApi } from '../structures/ContentFetchManager';
import { ClientManager } from '../structures/ClientManager';
import { Settings } from 'klasa';
import { ResolverOptions } from '../structures/Resolver';


// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {

	interface Client {
		llrcs: Set<LongLivingReactionCollector>;
		resolvers: ResolverStore;
		manager: ClientManager;
		readonly cache: ClientCache;
		readonly userCache: UserCache;
		readonly cdn: FetchApi;
	}

	interface Guild {
		readonly memberTags: MemberTags;
	}

	interface GuildChannel {
		settings: Settings;
	}

	interface GuildEmojiStore {
		guild: Guild;
	}

	interface GuildMember {
		settings: Settings;
	}

	interface GuildMemberStore {
		_fetchSingle(options: FetchMemberOptions): Promise<GuildMember>;

		_fetchMany(options: FetchMembersOptions): Promise<Collection<Snowflake, GuildMember>>;
	}

	interface Message {
		readonly text: TextChannel | null;
		readonly dm: DMChannel | null;

		nuke(time?: number): Promise<Message>;

		prompt(content: string, time?: number): Promise<Message>;
	}

	interface ClientOptions {
		cdnRequestTimeout?: number;
	}

	interface Collector<K, V> {
		[Symbol.iterator](): IterableIterator<V>;
	}
}

declare module 'klasa-dashboard-hooks' {
	interface AuthData {
		user_id: string;
	}
}

declare module 'klasa' {
	interface PieceDefaults {
		resolvers?: ResolverOptions;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;

		get(key: string): SettingsFolder | unknown | readonly unknown[];
	}
}
