import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';


@ApplyOptions<EventOptions>({
	once: true,
	event: 'ready'
})
export default class extends Event {

	public run(): void {
		return this.client.cache.clean(true);
	}

}
