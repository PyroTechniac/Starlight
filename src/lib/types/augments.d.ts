import { CustomGet } from '../settings/Shared';
import { BanStore } from '../structures/BanStore';
import { ContentDeliveryNetwork } from '../structures/ContentDeliveryNetwork';
import { ModerationManager } from '../structures/ModerationManager';
import { Locker } from '../util/Locker';

// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {
	interface Client {
		regions: null | Collection<string, VoiceRegion>;
		usertags: Collection<string, string>;
		cdn: ContentDeliveryNetwork;
		locker: Locker;
		fetchTag(id: string): Promise<string>;
		fetchUsername(id: string): Promise<string>;
	}

	interface Guild {
		moderation: ModerationManager;
		memberSnowflakes: Set<string>;
		readonly memberTags: Collection<string, string>;
		readonly memberUsernames: Collection<string, string>;
		readonly bans: BanStore;
	}

	interface Message {
		nuke(time?: number): Promise<Message>;
		prompt(content: string, time?: number): Promise<Message>;
	}

	interface ClientOptions {
		cdnSweepInterval?: number;
		twitch?: {
			clientID?: string;
			clientSecret?: string;
		};
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
