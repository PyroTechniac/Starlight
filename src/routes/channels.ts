import { Route } from '../lib';
import { RouteStore, KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

export default class extends Route {
    public constructor(store: RouteStore, file: string[], directory: string) {
        super(store, file, directory, {
            route: 'guilds/:guildID/channels'
        });
    }

    public get(request: KlasaIncomingMessage, response: ServerResponse): void {
        const { guildID } = request.params;
        const guild = this.client.guilds.get(guildID);
        if (!guild) return this.notFound(response);
        return response.end(JSON.stringify(guild.channels.keyArray()));
    }
}