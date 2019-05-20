import { Message, TextChannel } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';

export default class EchoCommand extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            name: 'echo',
            permissionLevel: 7,
            runIn: ['text'],
            description: 'Send a message to a channel through Starlight',
            usage: '[channel:channel] <message:string> [...]',
            usageDelim: ' '
        });
    }

    // @ts-ignore
    public async run(msg: KlasaMessage, [channel = (msg.channel as TextChannel)!, ...message]: [TextChannel, string[]]): Promise<Message | Message[]> {
        if (!channel.postable) throw 'I am not able to send messages in that channel';
        if (!channel.permissionsFor(msg.author!)!.has('SEND_MESSAGES')) throw 'You do not have permission to send messages in that channel';
        return channel.send(message.join(' '));
    }
}