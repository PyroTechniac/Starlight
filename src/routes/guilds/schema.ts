import { Route } from 'klasa-dashboard-hooks';
import { SetRoute } from '../../lib/util/Decorators';
import { ApiRequest, ApiResponse } from '../../lib/structures/ApiObjects';
import { Databases } from '../../lib/types/Enums';

@SetRoute('guilds/schema')
export default class extends Route {

	public get(_: ApiRequest, response: ApiResponse): void {
		const gateway = this.client.gateways.get(Databases.Guilds)!;
		return response.json(gateway.schema.toJSON());
	}

}
