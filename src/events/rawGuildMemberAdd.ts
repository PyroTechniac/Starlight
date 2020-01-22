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
		if (!guild?.available) return;


		guild.memberTags.set(data.user.id, {
			nickname: data.nick ?? null,
			roles: data.roles
		});
		guild.client.userCache.create(data.user);
	}

}
