import { Route } from '../lib';
import { RouteStore, KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

export default class extends Route {
    public constructor(store: RouteStore, file: string[], directory: string) {
        super(store, file, directory, {
            route: 'guilds'
        });
    }

    public get(request: KlasaIncomingMessage, response: ServerResponse): void {
        return response.end(JSON.stringify(this.client.guilds.keyArray()));
    }
}