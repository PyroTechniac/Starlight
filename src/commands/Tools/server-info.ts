import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';

export default class extends Command {
    private verificationLevels: string[] = [
        'None',
        'Low',
        'Medium',
        '(╯°□°）╯︵ ┻━┻',
        '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
    ];
    private filterLevels: string[] = [
        'Off',
        'No Role',
        'Everyone'
    ]
    private timestamp: Timestamp = new Timestamp('d MMMM YYYY');
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            runIn: ['text'],
            aliases: ['guild'],
            description: 'Get information on the current server.'
        });
    }

    public run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        return msg.sendEmbed(this.client.util.embed()
            .setColor(0x00AE86)
            .setThumbnail(msg.guild!.iconURL()!)
            .addField('❯ Name', msg.guild!.name, true)
            .addField('❯ ID', msg.guild!.id, true)
            .addField('❯ Creation Date', this.timestamp.display(msg.guild!.createdAt), true)
            .addField('❯ Region', msg.guild!.region, true)
            .addField('❯ Explicit Filter', this.filterLevels[msg.guild!.explicitContentFilter], true)
            .addField('❯ Verification Level', this.verificationLevels[msg.guild!.verificationLevel], true)
            .addField('❯ Owner', msg.guild!.owner ? msg.guild!.owner.user.tag : 'None', true)
            .addField('❯ Members', msg.guild!.memberCount, true));
    }
}