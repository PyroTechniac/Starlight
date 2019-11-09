import { Collection, Client } from 'discord.js';
import { ContentNode } from './ContentNode';
import { CollectionConstructor } from '@discordjs/collection';

export class ContentDeliveryNetwork extends Collection<string, ContentNode> {

	public readonly client!: Client;

	public fetchMap: WeakMap<ContentNode, Promise<ContentNode>>;

	private _timer: NodeJS.Timeout | null = null;

	public constructor(client: Client) {
		super();

		Object.defineProperty(this, 'client', { value: client });

		this.fetchMap = new WeakMap();
	}

	public get urls(): string[] {
		return this.map((node): string => node.url);
	}

	public fetch(force = false): Promise<ContentNode[]> {
		const nodes: Promise<ContentNode>[] = [];
		for (const node of this.values()) {
			nodes.push(node.fetch(force));
		}

		return Promise.all(nodes);
	}

	public acquire(url: string): ContentNode {
		url = url.toLowerCase();
		return (this.get(url) || this.create(url)).refresh();
	}

	public create(url: string): ContentNode {
		const node = new ContentNode(this.client, url);
		this.set(node.url, node);

		if (!this._timer) {
			this._timer = this.client.setInterval(() => {
				super.sweep((value): boolean => value.cacheExpired);
				if (!super.size) {
					this.client.clearInterval(this._timer!);
					this._timer = null;
				}
			}, 1000);
		}

		return node;
	}

	public static get [Symbol.species](): CollectionConstructor {
		return Collection as unknown as CollectionConstructor;
	}

}
