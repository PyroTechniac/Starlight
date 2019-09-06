import { ServerResponse } from 'http';
import { KlasaIncomingMessage, Route, RouteOptions } from 'klasa-dashboard-hooks';
import { ApplyOptions } from '../lib';

@ApplyOptions<RouteOptions>({
	route: 'users'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		return response.end(JSON.stringify(this.client.users.keyArray()));
	}

}
