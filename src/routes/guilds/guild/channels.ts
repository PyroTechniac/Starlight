import { Permissions } from 'discord.js';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';
import { ApiRequest } from '../../../lib/structures/api/ApiRequest';
import { ApiResponse } from '../../../lib/structures/api/ApiResponse';
import { flattenChannel } from '../../../lib/util/ApiTransform';
import { ApplyOptions, authenticated, rateLimit } from '../../../lib/util/Decorators';
import { noop } from '../../../lib/util/Utils';

const { FLAGS: { MANAGE_GUILD } } = Permissions;

@ApplyOptions<RouteOptions>({
	route: 'guilds/:guild/channels'
})
export default class extends Route {

    @authenticated
    @rateLimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse): Promise<void> {
		const guildID = request.params.guild;

		const guild = this.client.guilds.get(guildID);
		if (!guild) return response.error(400);

		const member = await guild.members.fetch(request.auth!.user_id).catch(noop);
		if (!member) return response.error(400);

		const canManage = member.permissions.has(MANAGE_GUILD);
		if (!canManage) return response.error(401);

		return response.json(guild.channels.map(flattenChannel));
	}

}
