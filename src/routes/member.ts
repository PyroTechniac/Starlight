import { Route, GetRequest } from '../lib';
import { RouteStore, KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

export default class extends Route implements GetRequest {
    public constructor(store: RouteStore, file: string[], directory: string) {
        super(store, file, directory, {
            route: 'guilds/:guildID/members/:memberID'
        });
    }

    public get(request: KlasaIncomingMessage, response: ServerResponse): void {
        const { guildID, memberID } = request.params;
        const guild = this.client.guilds.get(guildID);
        if (!guild) return this.notFound(response);
        const member = guild.members.get(memberID);
        if (!member) return this.notFound(response);
        return response.end(JSON.stringify(member));
    }
}