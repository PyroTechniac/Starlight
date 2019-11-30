import { CustomGet } from '../settings/Shared';
import { LongLivingReactionCollector } from '../util/LongLivingReactionCollector';
import { ResolverStore } from '../structures/ResolverStore';
import { CacheManager } from '../util/cache/CacheManager';
import { UserCache } from '../util/cache/UserCache';
import { MemberNicknames } from '../util/cache/MemberNicknames';
import { Fetch } from '../util/Cdn';
import { ClientManager } from '../structures/ClientManager';


// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {

	interface Client {
		llrcs: Set<LongLivingReactionCollector>;
		resolvers: ResolverStore;
		cache: CacheManager;
		manager: ClientManager;
		readonly userCache: UserCache;
		readonly cdn: Fetch;
	}

	interface Guild {
		readonly nicknames: MemberNicknames;
	}

	interface Message {
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
	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
		get(key: string): SettingsFolder | SettingsValue | readonly SettingsValue[];
	}
}
