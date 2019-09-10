import { Settings } from 'klasa';
import { ServerResponse } from 'http';
import { ModManager } from '../structures/ModManager';

// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {
	interface Client {
		regions: null | Collection<string, VoiceRegion>;
		awaitEvent(event: string): Promise<unknown>;
	}

	interface GuildMember {
		settings: Settings;
	}

	interface Guild {
		moderation: ModManager;
	}
}


declare module 'klasa-dashboard-hooks' {
	interface Route {
		notFound(response: ServerResponse): void;
	}
}
