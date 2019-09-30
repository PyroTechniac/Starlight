// Copyright (c) 2019 kyranet. All rights reserved. Apache-2.0
import { NodeMonitor } from '@structures/NodeMonitor';
import { WebSocketShard } from 'discord.js';

export default class extends NodeMonitor {

	public run(): {
		name: string;
		presence: null;
		statistics: {
			heapTotal: number;
			heapUsed: number;
			ping: [number, number, number];
			status: number;
		}[];
	} {
		const memoryUsage = process.memoryUsage();
		return {
			name: 'starlight',
			presence: null,
			statistics: this.client.ws.shards.map((shard: WebSocketShard): {
				heapTotal: number;
				heapUsed: number;
				ping: [number, number, number];
				status: number;
			} => ({
				heapTotal: memoryUsage.heapTotal,
				heapUsed: memoryUsage.heapUsed,
				ping: shard.pings,
				status: shard.status
			}))
		};
	}

}
