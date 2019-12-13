import { Route } from 'klasa-dashboard-hooks';
import { authenticated, ratelimit, SetRoute } from '../../lib/util/Decorators';
import { ApiRequest, ApiResponse } from '../../lib/structures/ApiObjects';
import { noop } from '../../lib/util/Utils';
import { FlattenedGuild, Transformer } from '../../lib/util/ApiTransform';

@SetRoute('users/@me')
export default class extends Route {

	@authenticated
	@ratelimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse): Promise<void> {
		const user = await this.client.users.fetch(request.auth!.user_id).catch(noop);
		if (user === null) return response.error(500);

		const guilds: FlattenedGuild[] = [];

		for (const guild of this.client.guilds.values()) {
			if (guild.memberTags.has(user.id)) guilds.push(Transformer.resolve(guild).transform());
		}
		return response.json({ guilds, ...Transformer.resolve(user).transform() });
	}

}
