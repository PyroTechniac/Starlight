import { IPCMonitor } from '../lib/structures/IPCMonitor';
import { WebSocketShard } from 'discord.js';
import { WebSocketStatistics } from '../lib/types/Interfaces';

export default class extends IPCMonitor {

	public async run(): Promise<{
		name: string;
		presence: null;
		statistics: WebSocketStatistics[];
	}> {
		const { heapUsed, heapTotal } = process.memoryUsage();

		return {
			name: 'starlight',
			presence: null,
			statistics: this.client.ws.shards.map((shard: WebSocketShard): WebSocketStatistics => ({
				heapTotal,
				heapUsed,
				ping: shard.pings,
				status: shard.status
			}))
		};
	}

}
