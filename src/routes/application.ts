import { ServerResponse } from 'http';
import { Duration } from 'klasa';
import { KlasaIncomingMessage, RouteStore } from 'klasa-dashboard-hooks';
import { GetRequest, Route } from '../lib';

export default class extends Route implements GetRequest {
    public constructor(store: RouteStore, file: string[], directory: string) {
        super(store, file, directory, {
            route: 'application'
        });
    }

    public get(request: KlasaIncomingMessage, response: ServerResponse): void {
        return response.end(JSON.stringify({
            users: this.client.users.size,
            guilds: this.client.guilds.size,
            channels: this.client.channels.size,
            shards: this.client.options.shardCount,
            uptime: Duration.toNow(Date.now() - (process.uptime() * 1000)),
            latency: this.client.ws.ping.toFixed(0),
            memory: process.memoryUsage().heapUsed / 1024 / 1024,
            invite: this.client.invite,
            ...this.client.application
        }));
    }
}