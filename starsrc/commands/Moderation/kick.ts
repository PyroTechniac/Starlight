import { Command, CommandStore, KlasaMessage } from 'klasa';
import { StarlightGuildMember } from '../../lib/extensions';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 6,
            requiredPermissions: ['KICK_MEMBERS'],
            runIn: ['text'],
            description: 'Kicks a mentioned user. Currently does not require reason (no mod-log).',
            usage: '<member:user> [reason:...string]',
            usageDelim: ' '
        });
    }

    public async run(msg: KlasaMessage, [member, reason]: [StarlightGuildMember, string]): Promise<KlasaMessage | KlasaMessage[]> {
        if (member.id === msg.author!.id) throw 'You cannot kick yourself.';
        if (member.id === this.client.user!.id) throw 'You cannot kick me.';

        if (member.roles.highest.position >= msg.member!.roles.highest.position) throw 'You cannot kick this user.';
        if (!member.kickable) throw 'I cannot kick this user.';

        await member.kick(reason);
        return msg.sendMessage(`**${member.user.tag}** has been kicked.${reason ? ` With reason of: ${reason}` : ''}`);
    }
}