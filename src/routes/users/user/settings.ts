import { Route } from 'klasa-dashboard-hooks';
import { authenticated, ratelimit, SetRoute } from '../../../lib/util/Decorators';
import { ApiRequest, ApiResponse } from '../../../lib/structures/ApiObjects';
import { noop } from '../../../lib/util/Utils';

@SetRoute('users/@me/settings')
export default class extends Route {

	@authenticated
	@ratelimit(5, 1000, true)
	public async get(request: ApiRequest, response: ApiResponse): Promise<void> {
		const user = await this.client.users.fetch(request.auth!.user_id).catch(noop);
		if (!user) return response.error(500);
		return response.json((await user.settings.sync()).toJSON());
	}

}
