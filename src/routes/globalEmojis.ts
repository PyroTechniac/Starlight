import { ServerResponse } from 'http';
import { KlasaIncomingMessage, Route, RouteOptions } from 'klasa-dashboard-hooks';
import { ApplyOptions } from '@utils/Decorators';

@ApplyOptions<RouteOptions>({
	route: 'emojis'
})
export default class extends Route {

	public get(_: KlasaIncomingMessage, response: ServerResponse): void {
		return response.end(JSON.stringify(this.client.emojis.keyArray()));
	}

}
