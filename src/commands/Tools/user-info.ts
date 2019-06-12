import { GuildMember } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';

export default class extends Command {
    private statuses: Record<string, string> = {
        online: '💚 Online',
        idle: '💛 Idle',
        dnd: '❤ Do Not Disturb',
        offline: '💔 Offline'
    };
    private timestamp: Timestamp = new Timestamp('d MMMM YYYY');
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            description: 'Get information on a mentioned user.',
            usage: '[Member:member]',
            runIn: ['text']
        });
    }

    public run(msg: KlasaMessage, [member = msg.member!]: [GuildMember]): Promise<KlasaMessage | KlasaMessage[]> {
        return msg.sendEmbed(this.client.util.embed()
            .setColor(member.displayHexColor || 0xFFFFFF)
            .setThumbnail(member.user.displayAvatarURL())
            .addField('❯ Name', member.user.tag, true)
            .addField('❯ ID', member.id, true)
            .addField('❯ Discord Join Date', this.timestamp.display(member.user.createdAt), true)
            .addField('❯ Server Join Date', this.timestamp.display(member.joinedTimestamp!), true)
            .addField('❯ Status', this.statuses[member.presence.status], true)
            .addField('❯ Playing', member.presence.activity ? member.presence.activity.name : 'N/A', true)
            .addField('❯ Highest Role', member.roles.size > 1 ? member.roles.highest.name : 'None', true)
            .addField('❯ Hoist Role', member.roles.hoist ? member.roles.hoist.name : 'None', true));
    }
}