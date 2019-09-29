import { Event } from 'klasa';
import { Events } from '@typings/Enums';

export default class extends Event {

	public run(...data: unknown[]): void {
		this.client.emit(Events.Warn, ...data);
	}

	public init(): Promise<void> {
		if (!this.client.options.consoleEvents.warn) this.disable();
		return Promise.resolve();
	}

}
