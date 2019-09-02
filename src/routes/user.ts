import { Route, RouteOptions, ApplyOptions } from '../lib';
import { KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

@ApplyOptions<RouteOptions>({
	route: 'users/:userID'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		const { userID } = request.params;
		const user = this.client.users.get(userID);
		if (!user) return this.notFound(response);
		return response.end(JSON.stringify(user));
	}

}
