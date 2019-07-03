import { Task } from 'klasa';
import { MuteInfo, Util } from '../lib';

export default class extends Task {
    public async run({ guild, user }: MuteInfo): Promise<void> {
        const _guild = this.client.guilds.get(guild);
        if (!_guild) return;
        const member = await _guild.members.fetch(user).catch(Util.noop);
        if (!member) return;
        await member.roles.remove(_guild.settings.get('roles.muted')! as string);
    }
}