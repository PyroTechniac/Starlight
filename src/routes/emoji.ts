import { ServerResponse } from 'http';
import { KlasaIncomingMessage, Route, RouteOptions } from 'klasa-dashboard-hooks';
import { ApplyOptions } from '@utils/Decorators';

@ApplyOptions<RouteOptions>({
	route: 'guilds/:guildID/emojis/:emojiID'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		const { guildID, emojiID } = request.params;
		const guild = this.client.guilds.get(guildID);
		if (!guild) return this.notFound(response);
		const emoji = guild.emojis.get(emojiID);
		if (!emoji) return this.notFound(response);
		return response.end(JSON.stringify(emoji));
	}

}
