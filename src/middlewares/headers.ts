import { Middleware, MiddlewareOptions } from 'klasa-dashboard-hooks';
import { ApplyOptions } from '../lib/util/Decorators';
import { ApiRequest } from '../lib/structures/api/ApiRequest';
import { ApiResponse } from '../lib/structures/api/ApiResponse';

@ApplyOptions<MiddlewareOptions>({
	priority: 10
})
export default class extends Middleware {

	public run(request: ApiRequest, response: ApiResponse): void {
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT');
		response.setHeader('Access-Control-Allow-Headers', 'Authorization, User-Agent, Content-Type');
		response.setHeader('Content-Type', 'application/json; charset=utf-8');
		if (request.method === 'OPTIONS') response.end('{"success":true}');
	}

}
