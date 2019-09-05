import { Route, RouteOptions, ApplyOptions } from '../lib';
import { KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

@ApplyOptions<RouteOptions>({
	route: 'guilds/:guildID/members/:memberID'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		const { guildID, memberID } = request.params;
		const guild = this.client.guilds.get(guildID);
		if (!guild) return this.notFound(response);
		const member = guild.members.get(memberID);
		if (!member) return this.notFound(response);
		return response.end(JSON.stringify(member));
	}

}