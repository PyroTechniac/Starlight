import { Event, EventStore, Settings } from 'klasa';
import { ShardClientUtil } from 'kurasuta';
const gateways = ['users', 'clientStorage'];

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, {
            event: 'settingsUpdate'
        });
    }

    public run(settings: Settings): void {
        if (gateways.includes(settings.gateway.name)) {
            (this.client.shard as unknown as ShardClientUtil).broadcastEval(`
                if (String(this.shard.id) !== '${(this.client.shard as unknown as ShardClientUtil).id}') {
                    const entry = this.gateways.get('${settings.gateway.name}').get('${settings.id}');
                    if (entry) {
                        entry._patch(${JSON.stringify(settings)});
                        entry.existenceStatus = true;
                        this.emit('settingsSync', entry);
                    }
                }
            `);
        }
    }

    public async init(): Promise<void> {
        if (!this.client.shard) this.disable();
    }
}