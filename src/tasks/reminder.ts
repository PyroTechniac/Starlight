import { TextChannel } from 'discord.js';
import { Task } from 'klasa';

export default class ReminderTask extends Task {
    public async run({ channel, user, text }: { channel: string; user: string; text: string }): Promise<void> {
        const _channel = this.client.channels.get(channel) as TextChannel;
        const _user = await this.client.users.fetch(user).catch((): null => null);
        if (_user && _user.send) await _user.send(`**Reminder:** ${text}`).catch((): null => null);
        else await _channel.send(`${user}, **Reminder:** ${text}`).catch((): null => null);
    }
}