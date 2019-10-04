import { Store, KlasaClient } from 'klasa';
import { Constructor } from '../types/Types';
import { IPCMonitor } from './IPCMonitor';
import { NodeMessage } from 'veza';
import { Events } from '../types/Enums';

export class IPCMonitorStore extends Store<string, IPCMonitor, Constructor<IPCMonitor>> {

	public constructor(client: KlasaClient) {
		// @ts-ignore 2345
		super(client, 'ipcMonitors', IPCMonitor);
	}

	public async run(message: NodeMessage): Promise<void> {
		try {
			this._checkPayload(message.data);
		} catch (err) {
			if (message.data) this.client.emit(Events.Wtf, `Invalid Payload: ${message.data}`);
			message.reply([0, err]);
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

	private _checkPayload(data: unknown): void {
		if (!Array.isArray(data) || data.length === 0 || data.length > 2 || typeof data[0] !== 'string') {
			throw 'INVALID_PAYLOAD';
		}
	}

}
