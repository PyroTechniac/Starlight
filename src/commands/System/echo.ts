import { DMChannel, MessageOptions, TextChannel } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['talk'],
            description: 'Make Starlight talk in another channel.',
            permissionLevel: 10,
            usage: '[channel:channel] [message:string] [...]',
            usageDelim: ' '
        });
    }

    public async run(msg: KlasaMessage, [channel = msg.channel, ...content]: [TextChannel | DMChannel, string[]]): Promise<KlasaMessage | KlasaMessage[]> {
        if (msg.deletable) msg.delete().catch((): null => null);
        const attachment = msg.attachments.size > 0 ? msg.attachments.first()!.url : null;
        const joinedContent = content.length ? content.join(' ') : '';

        if (joinedContent.length === 0 && !attachment) throw 'I have no content nor attachment to send, please write something.';

        const options: MessageOptions = {};
        if (attachment) options.files = [{ attachment }];

        return channel.send(joinedContent, options) as Promise<KlasaMessage | KlasaMessage[]>;
    }
}