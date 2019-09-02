import { Route as KlasaRoute, RouteOptions } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

const responses: [string, string] = ['[]', '{}'];

export abstract class Route extends KlasaRoute {

	protected notFound(response: ServerResponse): void {
		response.writeHead(404);
		return response.end(responses[this.parsed[this.parsed.length - 1].type]);
	}

}

export { RouteOptions };
