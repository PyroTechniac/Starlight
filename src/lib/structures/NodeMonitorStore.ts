// Copyright (c) 2019 kyranet. All Rights Reserved. Apache-2.0
import { Constructor } from '@typings/Types';
import { KlasaClient, Store } from 'klasa';
import { NodeMessage } from 'veza';
import { NodeMonitor } from './NodeMonitor';

export class NodeMonitorStore extends Store<string, NodeMonitor, Constructor<NodeMonitor>> {

	public constructor(client: KlasaClient) {
		// @ts-ignore 2345
		super(client, 'nodeMonitors', NodeMonitor);
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
