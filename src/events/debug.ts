import { Event } from 'klasa';

export default class extends Event {

	public run(warning: unknown): void {
		this.client.console.debug(warning);
	}

	public init(): Promise<void> {
		if (!this.client.options.consoleEvents.debug) this.disable();
		return Promise.resolve();
	}

}
