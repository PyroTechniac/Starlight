import { ApplyOptions } from '../lib/util/Decorators';
import { Event, EventOptions, EventStore, Settings } from 'klasa';
const gateways = ['clientStorage', 'users'];


@ApplyOptions<EventOptions>({
	event: 'settingsUpdate'
})
export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string, options: EventOptions) {
		super(store, file, directory, options);
		if (!this.client.shard) this.disable();
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
