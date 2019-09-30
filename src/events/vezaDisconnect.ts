import { Event, EventOptions } from 'klasa';
import { ClientSocket } from 'veza';
import { Events } from '@typings/Enums';
import { ApplyOptions } from '@utils/Decorators';

@ApplyOptions<EventOptions>({
	event: 'disconnect',
	emitter: 'node'
})
export default class extends Event {

	public run(client: ClientSocket): void {
		this.client.emit(Events.Warn, `${this.client.nodeMonitors.colors[1]} Disconnected: ${client.name}`);
	}

	public init(): Promise<void> {
		if (!this.client.node.servers.size) this.disable();
		return Promise.resolve();
	}

}
