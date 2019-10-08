import { Route, RouteOptions } from 'klasa-dashboard-hooks'
import { Permissions } from 'discord.js'
import { ApplyOptions, rateLimit, authenticated } from '../../../lib/util/Decorators';
import { ApiRequest } from '../../../lib/structures/api/ApiRequest';
import { ApiResponse } from '../../../lib/structures/api/ApiResponse';
import { noop } from '../../../lib/util/Utils';
import { Events } from '../../../lib/types/Enums';
import { inspect } from 'util';

const { FLAGS: { MANAGE_GUILD } } = Permissions;

@ApplyOptions<RouteOptions>({
    name: 'guildSettings',
    route: 'guilds/:guild/settings'
})
export default class extends Route {
    @authenticated
    @rateLimit(2, 5000, true)
    public async get(request: ApiRequest, response: ApiResponse) {
        const guildID = request.params.guild;


        const guild = this.client.guilds.get(guildID);
        if (!guild) return response.error(400);

        const member = await guild.members.fetch(request.auth!.user_id).catch(noop);
        if (!member) return response.error(400);

        const canManage = member.permissions.has(MANAGE_GUILD);
        if (!canManage) return response.error(401);

        return response.json(guild.settings.toJSON());
    }

    public async post(request: ApiRequest, response: ApiResponse) {
        const requestBody = request.body as Record<string, string>;

        if (!requestBody.guild_id || !requestBody.data || requestBody.guild_id !== request.params.guild) {
            return response.error(400);
        }

        const botGuild = this.client.guilds.get(requestBody.guild_id);
        if (!botGuild) return response.error(400);

        const member = await botGuild.members.fetch(request.auth!.user_id).catch(noop);
        if (!member) return response.error(400);

        const canManage = member.permissions.has(MANAGE_GUILD);
        if (!canManage) return response.error(401);

        const { errors } = await botGuild.settings.update(requestBody.data, { action: 'overwrite' });
        if (errors.length > 0) {
            this.client.emit(Events.Error,
                `${botGuild.name}[${botGuild.id}] failed guild settings update:\n${inspect(errors)}`);

            return response.error(500);
        }

        return response.json({ newSettings: botGuild.settings.toJSON() });

    }
}