import { Webhook, Client } from 'discord.js';
import { APIWebhookData } from '../typings/Interfaces';
import { CollectionConstructor, default as Collection } from '@discordjs/collection';

export class WebhookStore extends Collection<string, Webhook> {

	public readonly client!: Client;

	public constructor(client: Client) {
		super();

		Object.defineProperty(this, 'client', { value: client });
	}

	public add([name, data]: [string, APIWebhookData]): this {
		return this.set(name, new Webhook(this.client, data));
	}

	public static get [Symbol.species](): CollectionConstructor {
		return Collection as unknown as CollectionConstructor;
	}

}
