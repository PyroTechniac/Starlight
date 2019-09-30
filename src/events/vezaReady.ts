import { Event, EventOptions } from 'klasa';
import { Events } from '@typings/Enums';
import { ClientSocket } from 'veza';
import { ApplyOptions } from '@utils/Decorators';

@ApplyOptions<EventOptions>({
	once: true,
	emitter: 'node',
	event: 'ready'
})
export default class extends Event {

	public run(client: ClientSocket): void {
		this.client.emit(Events.Verbose, `${this.client.nodeMonitors[0]} Ready ${client.name}`);
	}

	public init(): Promise<void> {
		if (!this.client.node.servers.size) this.disable();
		return Promise.resolve();
	}
}
