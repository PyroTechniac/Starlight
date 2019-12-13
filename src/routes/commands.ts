import { Route } from 'klasa-dashboard-hooks';
import { ApiRequest, ApiResponse } from '../lib/structures/ApiObjects';
import { SetRoute, ratelimit } from '../lib/util/Decorators';
import { PermissionString } from 'discord.js';
import { isFunction } from '@klasa/utils';

@SetRoute('commands')
export default class extends Route {

	@ratelimit(2, 2500)
	public get(request: ApiRequest, response: ApiResponse): void {
		const { lang, category } = request.query;
		const language = (lang && this.client.languages.get(lang as string)) || this.client.languages.default;
		const commands = (category
			? this.client.commands.filter((cmd): boolean => cmd.category === category)
			: this.client.commands
		).filter((cmd): boolean => cmd.permissionLevel < 9);

		const serializedCommands = commands.map((cmd): SerializedCommand => ({
			bucket: cmd.bucket,
			category: cmd.category,
			cooldown: cmd.cooldown,
			description: isFunction(cmd.description) ? cmd.description(language) : cmd.description,
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

interface SerializedCommand {
	bucket: number;
	category: string;
	cooldown: number;
	description: string;
	guarded: boolean;
	guildOnly: boolean;
	name: string;
	permissionLevel: number;
	requiredPermissions: PermissionString[];
	usage: string;
}
