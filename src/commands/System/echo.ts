import { MessageOptions, TextChannel } from 'discord.js'
import { Command, CommandOptions, KlasaMessage } from 'klasa'
import { ApplyOptions, noop } from '../../lib'

@ApplyOptions<CommandOptions>({
    aliases: ['talk'],
    description: 'TBD',
    guarded: true,
    permissionLevel: 10,
    usage: '[channel:channel] [message:string] [...]',
    usageDelim: ' '
})
export default class extends Command {
    public async run(message: KlasaMessage, [channel = message.channel as TextChannel, ...content]: [TextChannel?, ...string[]]) {
        if (message.deletable) message.nuke().catch(noop);
    }
}