import { GuildMember } from 'discord.js';
import { Command, CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { ModLog } from '../../lib';

export default class WarnCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            name: 'warn',
            permissionLevel: 4,
            runIn: ['text'],
            description: 'Warns the mentioned member',
            usage: '<member:member> <reason:string> [...]',
            usageDelim: ' ',
            requiredPermissions: ['EMBED_LINKS']
        });
    }

    public async run(msg: KlasaMessage, [member, ...reason]: [GuildMember, string[]]): Promise<KlasaMessage | KlasaMessage[]> {
        // @ts-ignore
        reason = reason.length > 0 ? reason.join(' ') : reason;

        if (member.roles.highest.position >= msg.member!.roles.highest.position) {
            return msg.send(`Dear ${msg.author}, you may not execute this command on this member`);

        }

        if (msg.guild!.settings.get('channels.modlog')) {
            new ModLog(msg.guild!)
                .setType('warn')
                .setModerator(msg.author!)
                .setUser(member.user!)
                // @ts-ignore
                .setReason(reason)
                .send();
        }

        return msg.send(`Successfully warned the member ${member.user.tag}${reason ? `\nWith reason of ${reason}` : ''}`);
    }
}