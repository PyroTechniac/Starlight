import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { APIUserData } from '../lib/types/Interfaces';

@ApplyOptions<EventOptions>({
	event: 'USER_UPDATE',
	emitter: 'ws'
})
export default class extends Event {

	public run(data: APIUserData): void {
		const user = this.client.users.get(data.id);
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		if (user) user._patch(data);
	}

}
