import { Settings } from 'klasa';
import { WebhookStore } from '../structures/WebhookStore';
import { IPCMonitorOptions } from './Interfaces';
import { ModerationManager } from '../structures/ModerationManager';
import { BanStore } from '../structures/BanStore';
import { CustomGet } from '../settings/Shared';
import { ContentDeliveryNetwork } from '../structures/ContentDeliveryNetwork';

// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {
	interface Client {
		regions: null | Collection<string, VoiceRegion>;
		cdn: ContentDeliveryNetwork;
		waitFor(event: string): Promise<any[]>;
		webhooks: WebhookStore;
	}

	interface GuildMember {
		settings: Settings;
	}

	interface Guild {
		moderation: ModerationManager;
		readonly bans: BanStore;
	}

	interface Message {
		nuke(time?: number): Promise<Message>;
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
	interface PieceDefaults {
		ipcMonitors?: IPCMonitorOptions;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
		get(key: string): SettingsFolder | SettingsValue | readonly SettingsValue[];
	}
}
