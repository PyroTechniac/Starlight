import { Route, RouteOptions } from 'klasa-dashboard-hooks';
import { ApplyOptions, authenticated, rateLimit } from '../../lib/util/Decorators';
import { ApiRequest } from '../../lib/structures/api/ApiRequest';
import { ApiResponse } from '../../lib/structures/api/ApiResponse';
import { noop } from '../../lib/util/Utils';
import { flattenUser } from '../../lib/util/ApiTransform';

@ApplyOptions<RouteOptions>({
	route: 'users/@me'
})
export default class extends Route {

	@authenticated
	@rateLimit(2, 5000, true)
	public async get(request: ApiRequest, response: ApiResponse): Promise<void> {
		const user = await this.client.users.fetch(request.auth!.user_id).catch(noop);
		return user ? response.json(flattenUser(user)) : response.error(500);
	}

}
