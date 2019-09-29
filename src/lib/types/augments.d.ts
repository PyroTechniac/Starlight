import { ServerResponse } from 'http';
import { Settings } from 'klasa';
import { BaseNodeOptions, Node as Lavalink } from 'lavalink';
import { StarlightIterator, WebhookStore } from '../structures';

// This file is for augments to other modules, such as d.js or klasa.

declare module 'discord.js' {
	interface Client {
		regions: null | Collection<string, VoiceRegion>;
		waitFor(event: string): Promise<any[]>;
		lavalink: Lavalink | null;
		webhooks: WebhookStore;
		readonly ownersIter: StarlightIterator<User>;
	}

	namespace Client {
		export function from<V>(iter: Iterator<V> | Iterable<V>): StarlightIterator<V>;

		export const iter: typeof StarlightIterator;
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
