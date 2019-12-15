import { Resolver, ResolverContext, ResolverOptions } from '../lib/structures/Resolver';
import { Channel } from 'discord.js';
import { ApplyOptions } from '../lib/util/Decorators';

@ApplyOptions<ResolverOptions>({
	aliases: ['categorychannel', 'voicechannel', 'textchannel', 'guildchannel']
})
export default class extends Resolver<Channel> {

	public run(context: ResolverContext): Promise<null | Channel> {
		if (!Resolver.regex.channel.test(context.arg)) return Promise.resolve(null);
		const channel = (context.guild || this.client).channels.get(Resolver.regex.channel.exec(context.arg)![1]);
		return Promise.resolve(this.checkChannel(channel, context.type));
	}

	private checkChannel(channel: Channel | undefined, type: string): Channel | null {
		if (!channel) return null;
		if (
			(type === 'channel')
            || (type === 'guildchannel' && 'guild' in channel)
            || (type === 'textchannel' && channel.type === 'text')
            || (type === 'voicechannel' && channel.type === 'voice')
            || (type === 'categorychannel' && channel.type === 'category')
		) return channel;
		return null;
	}

}
