import { Command, CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Util } from '../../lib/util';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 6,
            requiredPermissions: ['BAN_MEMBERS'],
            runIn: ['text'],
            description: 'Bans a mentioned user. Currently does not require reason (no mod-log).',
            usage: '<member:user> [reason:...string]',
            usageDelim: ' '
        });
    }

    public async run(msg: KlasaMessage, [user, reason]: [KlasaUser, string]): Promise<KlasaMessage | KlasaMessage[]> {
        if (user.id === msg.author!.id) throw 'You cannot ban yourself.';
        if (user.id === this.client.user!.id) throw 'You cannot ban me silly.';

        const member = await msg.guild!.members.fetch(user).catch(Util.noop);
        if (member) {
            if (member.roles.highest.position >= msg.member!.roles.highest.position) throw 'You cannot ban this user.';
            if (!member.bannable) throw 'I am unable to ban this user.';
        }

        const options: Record<string, any> = {};
        if (reason) options.reason = reason;

        await msg.guild!.members.ban(user, options);
        return msg.sendMessage(`**${user.tag}** has been banned.${reason ? ` With reason of: ${reason}` : ''}`);
    }
}