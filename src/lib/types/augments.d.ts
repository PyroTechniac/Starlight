import { Settings } from 'klasa';
import { IPCMonitorStore } from '../structures/IPCMonitorStore';
import { StarlightIPCClient } from '../structures/StarlightIPCClient';
import { StarlightIterator } from '../structures/StarlightIterator';
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
		ipc: StarlightIPCClient;
		ipcMonitors: IPCMonitorStore;
		readonly ownersIter: StarlightIterator<User>;
	}

	namespace Client {
		export function from<V>(iter: Iterator<V> | Iterable<V>): StarlightIterator<V>;

		export const iter: typeof StarlightIterator;
	}

	interface GuildMember {
		settings: Settings;
	}

	interface Guild {
		moderation: ModerationManager;
		readonly bans: BanStore;
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
