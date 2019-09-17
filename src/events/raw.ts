import { Event } from 'klasa';
import { RawDiscordPacket } from '../lib';

export default class extends Event {

	private count: Map<string, number> = new Map();

	public run(data: RawDiscordPacket): void {
		if (data.t) this.count.set(data.t, (this.count.get(data.t) || 0) + 1);
	}

}
