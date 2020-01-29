import { CustomGet } from '../settings/Shared';
import { LongLivingReactionCollector } from '../util/LongLivingReactionCollector';
import { FetchApi } from '../structures/ContentFetchEngine';
import { ClientEngine } from '../structures/ClientEngine';
import { Resolver } from '../structures/Resolver';
import { SchemaEntry, Settings, SettingsFolderUpdateOptions, SettingsUpdateResults } from 'klasa';
import { FlagData } from './Interfaces';
import { FSWatcher } from 'chokidar';
import { AssetOptions } from '../structures/Asset';
import { AssetStore } from '../structures/AssetStore';
import { SchemaEngine } from '../structures/SchemaEngine';
import { AnyObject } from './Types';


// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {
	interface Client {
		llrcs: Set<LongLivingReactionCollector>;
		resolver: Resolver;
		engine: ClientEngine;
		fsWatcher: FSWatcher | null;
		assets: AssetStore;
		readonly schemas: SchemaEngine;
		readonly cdn: FetchApi;
	}

	interface GuildChannel {
		settings: Settings;
	}

	interface GuildEmojiStore {
		guild: Guild;

		fetch(id: Snowflake, cache?: boolean): Promise<GuildEmoji>;

		fetch(id?: Snowflake, cache?: boolean): Promise<Collection<Snowflake, GuildEmoji>>;
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

		readonly color: number;

		nuke(time?: number): Promise<Message>;

		prompt(content: string, time?: number): Promise<Message>;
	}

	interface ClientOptions {
		cdnRequestTimeout?: number;
		watchFiles?: boolean;
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

		setValue<K extends string, S>(key: CustomGet<K, S>, fn: (value: S) => S | Promise<S>, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;

		setValue(key: string, fn: (value: any) => unknown, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;

		increase<K extends string>(key: CustomGet<K, number>, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;

		increase(key: string, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;

		decrease<K extends string>(key: CustomGet<K, number>, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;

		decrease(key: string, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;
	}

	interface PieceDefaults {
		assets?: AssetOptions;
	}

	interface Provider {
		readonly shouldUnload: boolean;
	}

	interface SQLProvider {
		cValue(table: string, key: string, value: unknown): string;

		cValues(table: string, keys: readonly string[], values: readonly unknown[]): string[];

		parseSQLEntry(table: string, raw: Record<string, unknown> | null): null | Record<string, unknown>;

		parseValue(value: unknown, schemaEntry: SchemaEntry): unknown;

		parsePrimitiveValue(value: unknown, type: string): unknown;

		cIdentifier(value: string): string;

		cString(value: string): string;

		cNumber(value: number | bigint): string;

		cBoolean(value: boolean): string;

		cDate(value: Date): string;

		cJson(value: AnyObject): string;

		cArray(value: readonly unknown[]): string;

		cUnknown(value: unknown): string;
	}
}
