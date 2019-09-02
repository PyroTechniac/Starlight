import { Route, RouteOptions, ApplyOptions } from '../lib'
import { KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

@ApplyOptions<RouteOptions>({
    route: 'emojis'
})
export default class extends Route {
    public get(_: KlasaIncomingMessage, response: ServerResponse): void {
        return response.end(JSON.stringify(this.client.emojis.keyArray()));
    }
}