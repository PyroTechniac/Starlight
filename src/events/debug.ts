import { Event } from 'klasa';

const kReg = /(Sending a heartbeat|Latency of|\[VOICE]?)/i;

export default class extends Event {

	public run(warning: string): void {
		if (!kReg.test(warning)) this.client.console.debug(warning);
	}

	public init(): Promise<void> {
		if (!this.client.options.consoleEvents.debug) this.disable();
		return Promise.resolve();
	}

}
