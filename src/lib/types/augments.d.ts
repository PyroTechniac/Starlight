import { ServerResponse } from 'http';
import { Settings } from 'klasa';
import { BaseNodeOptions, Node as Lavalink } from 'lavalink';
import { WebhookStore } from '../structures';

// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {
	interface Client {
		regions: null | Collection<string, VoiceRegion>;
		awaitEvent(event: string): Promise<unknown>;
		lavalink: Lavalink | null;
		webhooks: WebhookStore;
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

declare module 'klasa' {
	interface KlasaClientOptions {
		lavalink?: BaseNodeOptions;
	}
}
