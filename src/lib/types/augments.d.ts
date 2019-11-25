import { CustomGet } from '../settings/Shared';
import { ContentDeliveryNetwork } from '../structures/ContentDeliveryNetwork';
import { LongLivingReactionCollector } from '../util/LongLivingReactionCollector';
import { ResolverStore } from '../structures/ResolverStore';
import { CacheManager } from '../util/cache/CacheManager';
import { UserCache } from '../util/cache/UserCache';
import { MemberNicknames } from '../util/cache/MemberNicknames';
import { Api } from '../util/Api'


// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {

	interface Client {
		regions: null | Collection<string, VoiceRegion>;
		cdn: ContentDeliveryNetwork;
		llrcs: Set<LongLivingReactionCollector>;
		resolvers: ResolverStore;
		cache: CacheManager;
		readonly discord: Api
		readonly userCache: UserCache;
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
