import { Command, CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { ModLog } from '../../lib';

export default class BanCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            name: 'ban',
            permissionLevel: 5,
            requiredPermissions: ['BAN_MEMBERS'],
            runIn: ['text'],
            description: (language): string => language.get('COMMAND_BAN_DESCRIPTION'),
            usage: '<user:user> [days:int{1,7}] [reason:string] [...]',
            usageDelim: ' '
        });
    }

    public async run(msg: KlasaMessage, [user, ...reason]: [KlasaUser, string]): Promise<KlasaMessage | KlasaMessage[]> {
        const newReason = reason.length > 0 ? reason.join(' ') : null;
        const days = 'days' in msg.flags ? Number.parseInt(msg.flags.days) : 7;


        const member = await this.client.util.fetchMember(msg.guild!, user.id, true);

		if (!member) { } // eslint-disable-line
        else if (member.roles.highest.position > msg.member!.roles.highest.position) {
            return msg.send(`${msg.language.get('DEAR')} ${msg.author!}, ${msg.language.get('POSITION')}`);
        } else if (member.bannable === false) {
            return msg.send(`${msg.language.get('DEAR')} ${msg.author!}, ${msg.language.get('COMMAND_BAN_FAIL_BANNABLE')}`);
        }

        await msg.guild!.members.ban(user, { reason: newReason as string, days });
        if (msg.guild!.settings.get('channels.modlog')) {
            new ModLog(msg.guild!)
                .setType('ban')
                .setModerator(msg.author!)
                .setUser(user)
                .setReason(reason)
                .send();
        }

        return msg.send(`${msg.language.get('COMMAND_BAN_SUCCESS')} ${user.tag}${reason ? `\n${msg.language.get('REASON')}: ${reason}` : ''}`);
    }
}