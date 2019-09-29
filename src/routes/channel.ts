import { ServerResponse } from 'http';
import { KlasaIncomingMessage, Route, RouteOptions } from 'klasa-dashboard-hooks';
import { ApplyOptions } from '@utils/Decorators';

@ApplyOptions<RouteOptions>({
	route: 'guilds/:guildID/channels/:channelID'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		const { guildID, channelID } = request.params;
		const guild = this.client.guilds.get(guildID);
		if (!guild) return this.notFound(response);
		const channel = guild.channels.get(channelID);
		if (!channel) return this.notFound(response);
		return response.end(JSON.stringify(channel));
	}

}
