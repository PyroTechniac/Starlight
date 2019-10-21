import { Command, CommandOptions, Language, KlasaMessage } from 'klasa';
import { ApplyOptions } from '../../../lib/util/Decorators';
import { TextChannel, MessageOptions } from 'discord.js';
import { noop } from '../../../lib/util/Utils';

@ApplyOptions<CommandOptions>({
	aliases: ['talk'],
	description: (lang: Language): string => lang.get('COMMAND_ECHO_DESCRIPTION'),
	extendedHelp: (lang: Language): string => lang.get('COMMAND_ECHO_EXTENDED'),
	guarded: true,
	permissionLevel: 10,
	usage: '[channel:channel] [message:string] [...]',
	usageDelim: ' '
})
export default class extends Command {

	public async run(message: KlasaMessage, [channel = message.channel as TextChannel, ...content]: [TextChannel?, ...string[]]): Promise<KlasaMessage> {
		if (message.deletable) message.nuke().catch(noop);

		const attachment = message.attachments.size ? message.attachments.first()!.url : null;
		const mesContent = content.length ? content.join(' ') : '';

		if (!mesContent && !attachment) {
			throw 'You haven\'t given me anything to send, please try again.';
		}

		const options: MessageOptions = {};
		if (attachment) options.files = [{ attachment }];

		await channel.send(mesContent, options);
		if (channel !== message.channel) await message.send(`Message successfully sent to ${channel}`);

		return message;
	}

}
