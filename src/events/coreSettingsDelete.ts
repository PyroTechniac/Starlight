import { Event, EventOptions, Settings } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
const gateways = ['clientStorage', 'users'];

@ApplyOptions<EventOptions>({
	event: 'settingsDelete'
})
export default class extends Event {

	public run(settings: Settings): void {
		if (!this.client.shard) return;
		if (gateways.includes(settings.gateway.name)) {
			this.client.shard.broadcastEval(`
				if (String(this.options.shards) !== '${this.client.options.shards}') {
					const entry = this.gateways.get('${settings.gateway.name}').get('${settings.id}');
					if (entry && entry.existenceStatus) {
						entry.init(entry, entry.schema);
						entry.existenceStatus = false;
						this.emit('settingsSync', entry);
					}
				}
			`);
		}
	}

}
