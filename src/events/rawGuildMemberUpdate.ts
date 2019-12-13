import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { WSGuildMemberUpdate } from '../lib/types/Interfaces';
import { noop } from '../lib/util/Utils';
import { MemberTag } from '../lib/util/cache/MemberTags';

@ApplyOptions<EventOptions>({
	event: 'GUILD_MEMBER_UPDATE',
	emitter: 'ws'
})
export default class extends Event {

	public async run(data: WSGuildMemberUpdate): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild) return;

		const updated: MemberTag = {
			nickname: data.nick ?? null,
			roles: data.roles
		};

		guild.memberTags.set(data.user.id, updated);

		this.client.userCache.create(data.user);
		const member = await guild.members.fetch(data.user.id).catch(noop);
		if (!member) return;
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		member._patch(data);
	}

}
