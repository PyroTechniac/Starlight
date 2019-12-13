import { Route } from 'klasa-dashboard-hooks';
import { authenticated, ratelimit, SetRoute } from '../../../lib/util/Decorators';
import { ApiRequest, ApiResponse } from '../../../lib/structures/ApiObjects';
import { noop } from '../../../lib/util/Utils';
import { FlattenedRole, Transformer } from '../../../lib/util/ApiTransform';

@SetRoute('guilds/:guild/roles')
export default class extends Route {

	@authenticated
	@ratelimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse): Promise<void> {
		const guildID = request.params.guild;

		const guild = this.client.guilds.get(guildID);
		if (!guild) return response.error(400);

		const member = await guild.members.fetch(request.auth!.user_id).catch(noop);
		if (!member) return response.error(400);

		const canManage = member.permissions.has('MANAGE_GUILD');
		if (!canManage) return response.error(401);

		return response.json(guild.roles.map((role): FlattenedRole => Transformer.resolve(role).transform()));
	}

}
