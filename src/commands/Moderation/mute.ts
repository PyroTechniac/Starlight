import { Command, CommandStore, KlasaMessage, Duration } from 'klasa';
import { GuildMember } from 'discord.js';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 6,
            requiredPermissions: ['MANAGE_ROLES'],
            runIn: ['text'],
            description: 'Mutes a mentioned member.',
            usage: '[when:time] <member:member> [reason:...string]',
            usageDelim: ' '
        });
    }

    public async run(msg: KlasaMessage, [when, member, reason]: [Date, GuildMember, string[]]): Promise<KlasaMessage | KlasaMessage[]> {
        if (member.id === msg.author!.id) throw 'You cannot mute yourself.';
        if (member.id === this.client.user!.id) throw 'You cannot mute me.';

        if (!msg.guild!.settings.get('roles.muted')) throw 'The muted role must be set.';

        if (member.roles.highest.position >= msg.member!.roles.highest.position) throw 'You cannot mute this user.';

        if (member.roles.has(msg.guild!.settings.get('roles.muted') as string)) throw 'That member is already muted.';

        await member.roles.add(msg.guild!.settings.get('roles.muted') as string);

        if (when) {
            await this.client.schedule.create('unmute', when, {
                data: {
                    guild: msg.guild!.id,
                    user: member.id
                }
            });
            return msg.sendMessage(`${member.user.tag} got temporarily muted for ${Duration.toNow(when)}.${reason ? ` With reason of: ${reason}` : ''}`);
        }

        return msg.sendMessage(`${member.user.tag} got muted.${reason ? ` With reason of: ${reason}` : ''}`);
    }
}