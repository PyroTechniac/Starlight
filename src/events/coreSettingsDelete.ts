import { Event, EventOptions, Settings } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { floatPromise } from '../lib/util/Utils';
const gateways = ['clientStorage', 'users'];

@ApplyOptions<EventOptions>({
	event: 'settingsDelete'
})
export default class extends Event {

	public run(settings: Settings): void {
		if (!this.client.shard) return;
		if (gateways.includes(settings.gateway.name)) {
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			floatPromise(this, this.client.shard.broadcastEval(`
				if (String(this.options.shards) !== '${this.client.options.shards}') {
					const entry = this.gateways.get('${settings.gateway.name}').get('${settings.id}');
					if (entry && entry.existenceStatus) {
						entry.init(entry, entry.schema);
						entry.existenceStatus = false;
						this.emit('settingsSync', entry);
					}
				}
			`));
		}
	}

}
