import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '../lib';

@ApplyOptions<EventOptions>({
	once: true
})
export default class extends Event {

	public async run(): Promise<void> {
		await this.client.settings!.update('owners', [...this.client.owners.values()], { arrayAction: 'overwrite' });

	}

}
