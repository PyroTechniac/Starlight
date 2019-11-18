import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { WSGuildMemberAdd } from '../lib/types/Interfaces';

@ApplyOptions<EventOptions>({
	event: 'GUILD_MEMBER_ADD',
	emitter: 'ws'
})
export default class extends Event {

	public run(data: WSGuildMemberAdd): void {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return;

		guild.nicknames.set(data.user.id, data.nick ?? null);
		guild.client.userCache.create(data.user);
	}

}
