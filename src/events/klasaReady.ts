import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { initClean } from '@klasa/utils';


@ApplyOptions<EventOptions>({
	once: true
})
export default class extends Event {

	public run(): void {
		initClean(this.client.token!);
	}

}
