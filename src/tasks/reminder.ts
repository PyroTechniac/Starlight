import { Collection, GuildChannel } from 'discord.js';
import { Task } from 'klasa';

export default class ReminderTask extends Task {
	public async run({ channel, user, text }: { channel: string, user: string, text: string }): Promise<void> {
		const _channel = this.client.util.resolveChannel(channel, this.client.channels as unknown as Collection<string, GuildChannel>)
		const _user = await this.client.users.fetch(user).catch((): null => null)
		if (_user && _user.send) await _user.send(`**Reminder:** ${text}`).catch((): null => null);
	}
}