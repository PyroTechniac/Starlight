import { Store, KlasaClient } from 'klasa'
import { Constructor } from '@typings/Types'
import { IPCMonitor } from './IPCMonitor'
import { NodeMessage } from 'veza';
import { Events } from '@typings/Enums';

export class IPCMonitorStore extends Store<string, IPCMonitor, Constructor<IPCMonitor>> {
    public constructor(client: KlasaClient) {
        // @ts-ignore 2345
        super(client, 'ipcMonitors', IPCMonitor);
    }

    public async run(message: NodeMessage) {
        if (!Array.isArray(message.data) || message.data.length === 0 || message.data.length > 2) {
            if (message.data) this.client.emit(Events.Wtf, 'Invalid Payload', message.data);
            message.reply([0, 'INVALID_PAYLOAD'])
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