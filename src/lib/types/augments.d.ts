import { CustomGet } from '../settings/Shared';
import { ContentDeliveryNetwork } from '../structures/ContentDeliveryNetwork';
import { Locker } from '../util/Locker';
import { Settings } from 'klasa';

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
		memberSnowflakes: Set<string>;
		readonly memberTags: Collection<string, string>;
		readonly memberUsernames: Collection<string, string>;
	}

	interface GuildMember {
		settings: Settings;
	}

	interface Message {
		nuke(time?: number): Promise<Message>;
		prompt(content: string, time?: number): Promise<Message>;
	}

	interface ClientOptions {
		cdnSweepInterval?: number;
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
