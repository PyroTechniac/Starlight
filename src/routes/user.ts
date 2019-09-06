import { ServerResponse } from 'http';
import { KlasaIncomingMessage, Route, RouteOptions } from 'klasa-dashboard-hooks';
import { ApplyOptions } from '../lib';

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
