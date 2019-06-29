import { GetRequest, Route } from '../lib';
import { KlasaIncomingMessage, RouteStore } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

export default class extends Route implements GetRequest {
    public constructor(store: RouteStore, file: string[], directory: string) {
        super(store, file, directory, {
            route: 'users/:userID'
        });
    }

    public get(request: KlasaIncomingMessage, response: ServerResponse): void {
        const { userID } = request.params;
        const user = this.client.users.get(userID);
        if (!user) return this.notFound(response);
        return response.end(JSON.stringify(user));
    }
}