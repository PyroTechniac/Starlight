import { Command, CommandStore, KlasaMessage, Client } from 'klasa';
const messageLimitHundreds = 1;

export default class RandomQuoteCommand extends Command {
    public constructor(client, store, file, directory) {
        super(client, store, file, directory, {
            description: 'Returns a random message from someone in the channel',
            requiredPermissions: ['READ_MESSAGE_HISTORY', 'EMBED_LINKS']
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        let messageBank = await msg.channel.messages.fetch({ limit: 100 });
        for (let i = 1; i < messageLimitHundreds; i++) {
            messageBank = messageBank.concat(await msg.channel.messages.fetch({ limit: 100, before: messageBank.last()!.id }));
        }

        const message = messageBank
            .filter((ms): boolean => !ms.author!.bot && ms.content.replace(/[\W0-9]*/g, '').length >= 20)
            .random();
        if (!message) throw 'Could not find a quote';
        return msg.sendEmbed(this.client.util.embed()
            .setDescription(message.content)
            .setAuthor(message.author!.username, message.author!.displayAvatarURL()));
    }
}