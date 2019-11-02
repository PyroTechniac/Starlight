import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '../lib/util/Decorators';
import { TextChannel } from 'discord.js';
import { WSMessageReactionAdd } from '../lib/types/Interfaces';
import { LLRCData } from '../lib/util/LongLivingReactionCollector';

@ApplyOptions<EventOptions>({
	event: 'MESSAGE_REACTION_ADD',
	emitter: 'ws'
})
export default class extends Event {

	public run(data: WSMessageReactionAdd): void {
		const channel = this.client.channels.get(data.channel_id) as TextChannel;
		if (!channel || channel.type !== 'text' || !channel.readable) return;

		const parsed: LLRCData = {
			channel,
			emoji: {
				animated: data.emoji.animated,
				id: data.emoji.id,
				managed: 'managed' in data.emoji ? data.emoji.managed! : null,
				name: data.emoji.name,
				requireColons: 'require_colons' in data.emoji ? data.emoji.require_colons! : null,
				roles: data.emoji.roles || null,
				user: (data.emoji.user && this.client.users.add(data.emoji.user)) || { id: data.user_id }
			},
			guild: channel.guild,
			messageID: data.message_id,
			userID: data.user_id
		};

		for (const llrc of this.client.llrcs) {
			llrc.send(parsed);
		}
	}

}
