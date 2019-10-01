import { Event, EventOptions, Settings, EventStore } from 'klasa'
import { ApplyOptions } from '@utils/Decorators'
const gateways = ['users', 'clientStorage'];

@ApplyOptions<EventOptions>({
    event: 'settingsCreate'
})
export default class extends Event {
    public constructor(store: EventStore, file: string[], directory: string, options: EventOptions) {
        super(store, file, directory, options);
        this.enabled = Boolean(this.client.shard);
    }
    public run(settings: Settings, updateObject: object): void {
        if (gateways.includes(settings.gateway.name)) {
            this.client.shard!.broadcastEval(`
				if (String(this.options.shards) !== '${this.client.options.shards}') {
					const entry = this.gateways.get('${settings.gateway.name}').get('${settings.id}');
					if (entry) {
						entry._patch(${JSON.stringify(updateObject)});
						entry.existenceStatus = true;
						this.emit('settingsSync', entry);
					}
				}
			`);
        }
    }
}