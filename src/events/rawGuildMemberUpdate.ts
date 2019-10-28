import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { WSGuildMemberUpdate } from '../lib/types/Interfaces';
import { noop } from '../lib/util/Utils';

@ApplyOptions<EventOptions>({
	event: 'GUILD_MEMBER_UPDATE',
	emitter: 'ws'
})
export default class extends Event {

	public async run(data: WSGuildMemberUpdate): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild) return;

		guild.memberSnowflakes.add(data.user.id);
		this.client.usertags.set(data.user.id, `${data.user.username}#${data.user.discriminator}`);
		const member = await guild.members.fetch(data.user.id).catch(noop);
		if (!member) return;
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		member._patch(data);
	}

}
