import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { Events } from '../lib/types/Enums';

@ApplyOptions<EventOptions>({
	emitter: process
})
export default class extends Event {

	public run(err: Error | undefined): void {
		if (!err) return;
		this.client.emit(Events.Error, `Uncaught Promise Error: \n${err.stack ?? err}`);
	}

	public init(): Promise<void> {
		if (this.client.options.production) this.disable();
		return Promise.resolve();
	}

}
