import { Event } from 'klasa';
import { Events } from '../lib';

export default class extends Event {

	public run(...data: any[]): void {
		this.client.emit(Events.Warn, ...data);
	}

	public init(): Promise<void> {
		if (!this.client.options.consoleEvents.warn) this.disable();
		return Promise.resolve();
	}

}
