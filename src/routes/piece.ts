import { GetRequest, Route } from '../lib';
import { KlasaIncomingMessage, RouteStore } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

export default class extends Route implements GetRequest{
    public constructor(store: RouteStore, file: string[], directory: string) {
        super(store, file, directory, {
            route: 'pieces/:type/:name'
        });
    }

    public get(request: KlasaIncomingMessage, response: ServerResponse): void {
        const { type, name } = request.params;
        const store = this.client.pieceStores.get(type);
        if (!store) return this.notFound(response);
        if (name === 'all') return response.end(JSON.stringify(store.keyArray()));
        const piece = store.get(name);
        if (!piece) return this.notFound(response);
        return response.end(JSON.stringify(piece));
    }
}