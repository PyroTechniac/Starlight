import { ServerResponse } from 'http';
import { KlasaIncomingMessage, Route, RouteOptions } from 'klasa-dashboard-hooks';
import { ApplyOptions } from '../lib/util/Decorators';

@ApplyOptions<RouteOptions>({
	route: 'guilds'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		return response.end(JSON.stringify(this.client.guilds.keyArray()));
	}

}
