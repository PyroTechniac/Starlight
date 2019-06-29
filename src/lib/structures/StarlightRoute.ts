import { ServerResponse } from 'http';
import { Route as KlasaRoute } from 'klasa-dashboard-hooks';

abstract class StarlightRoute extends KlasaRoute {
    private endsWith: '{}' | '[]' = this.parsed[this.parsed.length - 1].type === 1 ? '{}' : '[]';

    protected notFound(response: ServerResponse): void {
        response.writeHead(404);
        return response.end(this.endsWith);
    }
}

export { StarlightRoute as Route };
