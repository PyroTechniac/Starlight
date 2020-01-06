import { CustomGet } from '../settings/Shared';
import { LongLivingReactionCollector } from '../util/LongLivingReactionCollector';
import { ClientCacheManager } from '../util/cache/ClientCacheManager';
import { UserCache } from '../util/cache/UserCache';
import { MemberTags } from '../util/cache/MemberTags';
import { FetchApi } from '../structures/ContentFetchManager';
import { ClientManager } from '../structures/ClientManager';
import { Resolver } from '../structures/Resolver';
import { Settings } from 'klasa';
import { FlagData } from './Interfaces';
import {FSWatcher} from 'chokidar'

// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {
	interface Client {
		llrcs: Set<LongLivingReactionCollector>;
		resolver: Resolver;
		manager: ClientManager;
		fsWatcher: FSWatcher | null;
		readonly cache: ClientCacheManager;
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
		watchFiles?: boolean;
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
	interface CommandOptions {
		flags?: Record<string, FlagData>;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;

		get(key: string): SettingsFolder | unknown | readonly unknown[];
	}
}
