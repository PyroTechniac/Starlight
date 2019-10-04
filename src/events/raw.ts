import { RawDiscordPacket } from '../lib/types/Interfaces';
import { Event } from 'klasa';

export default class extends Event {

	public count: Map<string, number> = new Map();

	public run(data: RawDiscordPacket): void {
		if (data.t) this.count.set(data.t, (this.count.get(data.t) || 0) + 1);
	}

}
