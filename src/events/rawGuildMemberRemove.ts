import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { WSGuildMemberRemove } from '../lib/types/Interfaces';

@ApplyOptions<EventOptions>({
	event: 'GUILD_MEMBER_REMOVE',
	emitter: 'ws'
})
export default class extends Event {

	public run(data: WSGuildMemberRemove): void {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return;

		guild.nicknames.delete(data.user.id);
		if (!this.client.guilds.some((g): boolean => g.nicknames.has(data.user.id))) this.client.userCache.delete(data.user.id);
		if (guild.members.has(data.user.id)) guild.members.delete(data.user.id);
	}

}
