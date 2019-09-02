import { Route, RouteOptions, ApplyOptions } from '../lib';
import { ServerResponse } from 'http';
import { KlasaIncomingMessage } from 'klasa-dashboard-hooks';

@ApplyOptions<RouteOptions>({
	route: 'users'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		return response.end(JSON.stringify(this.client.users.keyArray()));
	}

}
