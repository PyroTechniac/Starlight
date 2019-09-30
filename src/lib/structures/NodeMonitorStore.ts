// Copyright (c) 2019 kyranet. All Rights Reserved. Apache-2.0
import { Store, KlasaClient, Colors } from 'klasa';
import { NodeMessage } from 'veza';
import { NodeMonitor } from './NodeMonitor';
import { Constructor } from '@typings/Types';
const colors: [string, string, string] = ['green', 'yellow', 'red'];

export class NodeMonitorStore extends Store<string, NodeMonitor, Constructor<NodeMonitor>> {

	public colors: [string, string, string];
	public constructor(client: KlasaClient) {
		// @ts-ignore 2345
		super(client, 'nodeMonitors', NodeMonitor);
		const formatted: [string, string, string] = colors.map((text): string => new Colors({ text }).format('[IPC   ]')) as [string, string, string];
		this.colors = formatted;
	}

	public async run(message: NodeMessage): Promise<void> {
		if (!Array.isArray(message.data) || message.data.length === 0 || message.data.length > 2) {
			if (message.data) this.client.console.wtf('Invalid Payload', message.data);
			message.reply([0, 'INVALID_PAYLOAD']);
			return;
		}

		const [route, payload = null] = message.data;

		const monitor = this.get(route);
		if (!monitor) {
			message.reply([0, 'UNKNOWN_ROUTE']);
			return;
		}

		try {
			const result = await monitor.run(payload);
			message.reply([1, result]);
		} catch (error) {
			message.reply([0, error]);
		}
	}

}
