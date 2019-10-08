import { Route, RouteOptions } from 'klasa-dashboard-hooks';
import { authenticated, ApplyOptions } from '../lib/util/Decorators';
import { ApiRequest } from '../lib/structures/api/ApiRequest';
import { ApiResponse } from '../lib/structures/api/ApiResponse';

@ApplyOptions<RouteOptions>({
	route: ''
})
export default class extends Route {

	public get(_request: ApiRequest, response: ApiResponse): void {
		response.json({ message: 'Hello World' });
	}

    @authenticated
	public post(_request: ApiRequest, response: ApiResponse): void {
		response.json({ message: 'Hello World' });
	}

}
