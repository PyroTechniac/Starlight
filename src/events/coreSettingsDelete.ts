import { Event, EventStore, Settings } from 'klasa';
import { ShardClientUtil } from 'kurasuta';
const gateways = ['users', 'clientStorage'];

export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string) {
        super(store, file, directory, { event: 'settingsDelete' });
    }

    public run(settings: Settings): void {
        if (!this.client.shard) return;
        if (gateways.includes(settings.gateway.name)) {
            this.client.shard!.broadcastEval(`
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
}