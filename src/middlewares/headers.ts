import { ServerResponse } from 'http';
import { KlasaIncomingMessage, Middleware, MiddlewareOptions } from 'klasa-dashboard-hooks';
import { ApplyOptions } from '../lib';

@ApplyOptions<MiddlewareOptions>({
	priority: 10
})
export default class extends Middleware {

	public run(request: KlasaIncomingMessage, response: ServerResponse): Promise<void> {
		response.setHeader('Access-Control-Allow-Origin', this.client.options.dashboardHooks.origin!);
		response.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT');
		response.setHeader('Access-Control-Allow-Headers', 'Authorization, User-Agent, Content-Type');
		if (request.method === 'OPTIONS') return Promise.resolve(response.end('Something'));
		response.setHeader('Content-Type', 'application/json');
		return Promise.resolve(undefined);
	}

}
