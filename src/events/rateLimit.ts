import { Event, Colors } from 'klasa';
import { RateLimitInfo, Events } from '../lib';

const HEADER = new Colors({ text: 'red' }).format('[RATELIMIT]');

export default class extends Event {

	public run({ method, timeout, limit, route, path }: RateLimitInfo): void {
		this.client.emit(Events.VERBOSE, [
			HEADER,
			`Timeout: ${timeout}ms`,
			`Limit: ${limit} requests`,
			`Method: ${method.toUpperCase()}`,
			`Route: ${route}`,
			`Path: ${path}`
		].join('\n'));
	}

}
