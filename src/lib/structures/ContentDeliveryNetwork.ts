import { Collection, Client } from 'discord.js';
import { ContentNode } from './ContentNode';
import { CollectionConstructor } from '@discordjs/collection';

export class ContentDeliveryNetwork extends Collection<string, ContentNode> {

	public readonly client!: Client;

	public fetchMap: WeakMap<ContentNode, Promise<ContentNode>>;

	public constructor(client: Client) {
		super();

		Object.defineProperty(this, 'client', { value: client });

		this.fetchMap = new WeakMap();
	}

	public acquire(url: string): ContentNode {
		return this.get(url) || this.create(url);
	}

	public create(url: string): ContentNode {
		const node = new ContentNode(this.client, url);
		this.set(node.url, node);

		return node;
	}

	public static get [Symbol.species](): CollectionConstructor {
		return Collection as unknown as CollectionConstructor;
	}

}
