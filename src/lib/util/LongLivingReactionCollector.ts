import { Client, Guild, TextChannel, User } from 'discord.js';

export type LongLivingReactionCollectorListener = (reaction: LLRCData) => void;

export class LongLivingReactionCollector {

	public client: Client;
	public listener: LongLivingReactionCollectorListener | null;
	public endListener: (() => void) | null;

	private _timer: NodeJS.Timeout | null = null;

	public constructor(client: Client, listener: LongLivingReactionCollectorListener | null = null, endListener: (() => void) | null = null) {
		this.client = client;
		this.listener = listener;
		this.endListener = endListener;
		this.client.llrcs.add(this);
	}

	public get ended(): boolean {
		return this.client.llrcs.has(this);
	}

	public setListener(listener: LongLivingReactionCollectorListener | null): this {
		this.listener = listener;
		return this;
	}

	public setEndListener(listener: () => void): this {
		this.endListener = listener;
		return this;
	}

	public send(reaction: LLRCData): void {
		if (this.listener) this.listener(reaction);
	}

	public setTime(time: number): this {
		if (this._timer) this.client.clearTimeout(this._timer);
		if (time === -1) this._timer = null;
		else this._timer = this.client.setTimeout((): this => this.end(), time);
		return this;
	}

	public end(): this {
		if (!this.client.llrcs.delete(this)) return this;

		if (this._timer) {
			this.client.clearTimeout(this._timer);
			this._timer = null;
		}

		if (this.endListener) {
			process.nextTick(this.endListener.bind(null));
			this.endListener = null;
		}

		return this;
	}

}


export interface LLRCDataEmoji {
	animated: boolean;
	id: string | null;
	managed: boolean | null;
	name: string;
	requireColons: boolean | null;
	roles: string[] | null;
	user: User | { id: string };
}

export interface LLRCData {
	channel: TextChannel;
	emoji: LLRCDataEmoji;
	guild: Guild;
	messageID: string;
	userID: string;
}
