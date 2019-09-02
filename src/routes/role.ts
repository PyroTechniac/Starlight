import { Route, RouteOptions, ApplyOptions } from '../lib';
import { KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

@ApplyOptions<RouteOptions>({
	route: 'guilds/:guildID/roles/:roleID'
})
export default class extends Route {

	public get(request: KlasaIncomingMessage, response: ServerResponse): void {
		const { guildID, roleID } = request.params;
		const guild = this.client.guilds.get(guildID);
		if (!guild) return this.notFound(response);
		const role = guild.roles.get(roleID);
		if (!role) return this.notFound(response);
		return response.end(JSON.stringify(role));
	}

}
