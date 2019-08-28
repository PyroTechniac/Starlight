import { Event } from 'klasa';
import { Events } from '../lib';

export default class extends Event {

	public run(...data: any[]): void {
		this.client.emit(Events.WARN, ...data);
	}

}
