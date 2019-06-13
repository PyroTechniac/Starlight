import { Event, EventStore, Settings } from 'klasa';
import { ShardClientUtil } from 'kurasuta';
const gateways: string[] = ['users', 'clientStorage'];

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, { event: 'settingsDelete' });
    }

    public run(settings: Settings): void {
        if (gateways.includes(settings.gateway.name)) {
            (this.client.shard as unknown as ShardClientUtil).broadcastEval(`
                if (String(this.shard.id) !== '${(this.client.shard as unknown as ShardClientUtil).id}') {
                    const entry = this.gateways.get('${settings.gateway.name}').get('${settings.id}');
                    if (entry && entry.existenceStatus) {
                        this.emit('settingsDelete', entry);
                        entry.init(entry, entry.schema);
                        entry.existenceStatus = false;
                    }
                }
            `);
        }
    }

    public async init(): Promise<void> {
        if (!this.client.shard) this.disable();
    }
}