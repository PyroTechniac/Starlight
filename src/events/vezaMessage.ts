import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '@utils/Decorators';
import { NodeMessage } from 'veza';

@ApplyOptions<EventOptions>({
	emitter: 'node',
	event: 'message'
})
export default class extends Event {

	public run(message: NodeMessage): void {
		this.client.nodeMonitors.run(message);
	}

	public init(): Promise<void> {
		if (!this.client.node.servers.size) this.disable();
		return Promise.resolve();
	}

}
