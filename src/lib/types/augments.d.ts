import { Settings } from 'klasa';
import { ServerResponse } from 'http';
import { DataResolver as CustomDataResolver } from '../util';

// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {
	interface Client {
		regions: null | Collection<string, VoiceRegion>;
		awaitEvent(event: string): Promise<unknown>;
		resolver: CustomDataResolver;
	}

	interface GuildMember {
		settings: Settings;
	}
}


declare module 'klasa-dashboard-hooks' {
	interface Route {
		notFound(response: ServerResponse): void;
	}
}
