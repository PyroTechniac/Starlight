import { Gateway, Settings } from 'klasa';
import { GuildChannel } from 'discord.js';

export class ChannelGateway extends Gateway {

	public get type(): string {
		return this.name.split('Channels')[0]!;
	}

	public get(id: string): Settings | null {
		const channel = this.client.channels.get(id) as GuildChannel | undefined;
		return (channel && channel.type === this.type && channel.settings) || null;
	}

}
