import { DashboardUser, Route, RouteOptions } from 'klasa-dashboard-hooks';
import fetch from 'node-fetch';
import { ApplyOptions } from '../../lib/util/Decorators';

@ApplyOptions<RouteOptions>({
	route: 'oauth/user'
})
export default class extends Route {

	public async api(token: string): Promise<DashboardUser> {
		token = `Bearer ${token}`;

		const user = await fetch('https://discordapp.com/api/users/@me', { headers: { Authorization: token } })
			.then((res): Promise<any> => res.json());
		user.guilds = await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { Authorization: token } })
			.then((result): Promise<any> => result.json());
		return this.client.dashboardUsers.add(user);
	}

}
