import { Route, RouteOptions, ApplyOptions } from '../lib';
import { KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

@ApplyOptions<RouteOptions>({
	route: 'emojis/:emojiID'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		const { emojiID } = request.params;
		const emoji = this.client.emojis.get(emojiID);
		if (!emoji) return this.notFound(response);
		return response.end(JSON.stringify(emoji));
	}

}
