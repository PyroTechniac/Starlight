import { Route, RouteOptions, ApplyOptions } from '../lib';
import { KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

@ApplyOptions<RouteOptions>({
	route: 'pieces/:type/:name'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		const { type, name } = request.params;
		const store = this.client.pieceStores.get(type);
		if (!store) return this.notFound(response);
		if (name === 'all') return response.end(JSON.stringify(store.array()));
		const piece = store.get(name);
		if (!piece) return this.notFound(response);
		return response.end(JSON.stringify(piece));
	}

}