import { Event, EventOptions, KlasaGuild } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { WSGuildCreate } from '../lib/types/Interfaces';
import { Events } from '../lib/types/Enums';

@ApplyOptions<EventOptions>({
	event: 'GUILD_CREATE',
	emitter: 'ws'
})
export default class extends Event {

	public run(data: WSGuildCreate & {shardID: number}, shardID: number): void {
		data.presences = [];
		let guild = this.client.guilds.get(data.id);

		if (guild) {
			if (!guild.available && !data.unavailable) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				guild._patch(data);
			}
		} else {
			data.shardID = shardID;
			guild = this.client.guilds.add(data);
			if (this.client.ws.status === 0) {
				this.client.emit(Events.GuildCreate, guild);
			}
		}

		this.processSweep(guild);
	}

	private processSweep(guild: KlasaGuild): void {
		for (const member of guild.members.values()) {
			this.client.userCache.create(member.user);
			guild.memberTags.create(member);
		}

		for (const emoji of guild.emojis.values()) {
			guild.emojiCache.create(emoji);
		}

		const { me } = guild;

		guild.members.clear();
		this.client.users.clear();
		guild.emojis.clear();

		if (me !== null) {
			guild.members.set(me.id, me);
			this.client.users.set(me.id, me.user);
		}
	}

}
