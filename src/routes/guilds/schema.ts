import { Route, RouteOptions } from 'klasa-dashboard-hooks'
import { ApplyOptions, rateLimit } from '../../lib/util/Decorators';
import { ApiRequest } from '../../lib/structures/api/ApiRequest';
import { ApiResponse } from '../../lib/structures/api/ApiResponse';
import { Databases } from '../../lib/types/Enums';

@ApplyOptions<RouteOptions>({
    route: 'guilds/schema'
})
export default class extends Route {
    @rateLimit(2, 5000)
    public get(_request: ApiRequest, response: ApiResponse) {
        const gateway = this.client.gateways.get(Databases.Guilds)!;
        return response.json(gateway.schema.toJSON());
    }
}