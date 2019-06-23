import { Route as KlasaRoute } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

abstract class StarlightRoute extends KlasaRoute {
    protected notFound(response: ServerResponse): void {
        response.writeHead(404);
        const endsWith = this.parsed[this.parsed.length - 1].type === 1 ? '{}' : '[]';
        return response.end(endsWith);
    }
}

export { StarlightRoute as Route };