import { Command, CommandStore, KlasaMessage, KlasaUser } from 'klasa';

export default class AvatarCommand extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            description: 'Shows a user\'s avatar',
            usage: '[user:user]'
        });
    }

    public async run(msg: KlasaMessage, [user = msg.author!]: [KlasaUser]): Promise<KlasaMessage | KlasaMessage[]> {
        const avatar = user.displayAvatarURL({ size: 512 });

        return msg.sendEmbed(this.client.util.embed()
            .setAuthor(user.username, avatar)
            .setImage(avatar));
    }
}