import { Route, GetRequest } from '../lib';
import { RouteStore, KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

export default class extends Route implements GetRequest {
    public constructor(store: RouteStore, file: string[], directory: string) {
        super(store, file, directory, {
            route: 'pieces/:type'
        });
    }

    public get(request: KlasaIncomingMessage, response: ServerResponse): void {
        const { type } = request.params;
        const store = this.client.pieceStores.get(type);
        if (!store) return this.notFound(response);
        return response.end(JSON.stringify(store.keyArray()));
    }
}