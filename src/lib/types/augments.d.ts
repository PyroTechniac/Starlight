import 'klasa';
import { CustomGet } from '../settings/Shared';
import { BanStore } from '../structures/BanStore';
import { ContentDeliveryNetwork } from '../structures/ContentDeliveryNetwork';
import { ModerationManager } from '../structures/ModerationManager';
import { WebhookStore } from '../structures/WebhookStore';
import { IPCMonitorOptions } from './Interfaces';

// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {
	interface Client {
		regions: null | Collection<string, VoiceRegion>;
		cdn: ContentDeliveryNetwork;
		waitFor(event: string): Promise<any[]>;
		webhooks: WebhookStore;
	}

	interface Guild {
		moderation: ModerationManager;
		readonly bans: BanStore;
	}

	interface Message {
		nuke(time?: number): Promise<Message>;
	}

	interface User {
		authenticated: boolean;
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
