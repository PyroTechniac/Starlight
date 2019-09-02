import { Route, RouteOptions, ApplyOptions } from '../lib';
import { KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

@ApplyOptions<RouteOptions>({
	route: 'guilds'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		return response.end(JSON.stringify(this.client.guilds.keyArray()));
	}

}
