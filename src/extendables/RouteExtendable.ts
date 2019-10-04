import { ServerResponse } from 'http';
import { Extendable, ExtendableOptions } from 'klasa';
import { Route } from 'klasa-dashboard-hooks';
import { ApplyOptions } from '../lib/util/Decorators';

const responses: [string, string] = ['[]', '{}'];

@ApplyOptions<ExtendableOptions>({
	appliesTo: [Route]
})
export default class extends Extendable {

	protected notFound(this: Route, response: ServerResponse): void {
		response.writeHead(404);
		return response.end(responses[this.parsed[this.parsed.length - 1].type]);
	}

}
