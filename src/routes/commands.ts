import { Route, RouteOptions } from 'klasa-dashboard-hooks';
import { ApplyOptions, rateLimit } from '../lib/util/Decorators';
import { ApiRequest } from '../lib/structures/api/ApiRequest';
import { ApiResponse } from '../lib/structures/api/ApiResponse';
import { util } from 'klasa';

@ApplyOptions<RouteOptions>({
	route: 'commands'
})
export default class extends Route {

    @rateLimit(2, 2500)
	public get(request: ApiRequest, response: ApiResponse): void {
		const { lang, category } = request.query;
		const language = (lang && this.client.languages.get(lang as string)) || this.client.languages.default;
		const commands = (category
			? this.client.commands.filter((cmd): boolean => cmd.category === category)
			: this.client.commands
		).filter((cmd): boolean => cmd.permissionLevel < 9);

		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		const serializedCommands = commands.map(cmd => ({
			bucket: cmd.bucket,
			category: cmd.category,
			cooldown: cmd.cooldown,
			description: util.isFunction(cmd.description) ? cmd.description(language) : cmd.description,
			guarded: cmd.guarded,
			guildOnly: !cmd.runIn.includes('dm'),
			name: cmd.name,
			permissionLevel: cmd.permissionLevel,
			requiredPermissions: cmd.requiredPermissions.toArray(),
			usage: cmd.usageString
		}));
		return response.json(serializedCommands);
	}

}
