import { Command, CommandStore, Client, KlasaUser, KlasaMessage } from 'klasa';

export default class AvatarCommand extends Command {
    public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
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