import { Command, CommandOptions, Language, KlasaMessage, Stopwatch, util } from 'klasa';
import { ApplyOptions } from '../../../lib/util/Decorators';

@ApplyOptions<CommandOptions>({
	aliases: ['b-ev', 'b-eval'],
	description: (lang: Language): string => lang.get('COMMAND_EVAL_DESCRIPTION'),
	extendedHelp: (lang: Language): string => lang.get('COMMAND_EVAL_EXTENDEDHELP'),
	guarded: true,
	permissionLevel: 10,
	usage: '<expression:string>',
	flagSupport: true
})
export default class extends Command {

	public async run(message: KlasaMessage, [code]: [string]): Promise<KlasaMessage> {
		if (message.flagArgs.async) code = `(async () => {\n${code}\n})();`;
		let result: string;
		let success: boolean;
		let time: string;

		const stopwatch = new Stopwatch();
		try {
			[success, result] = await this.client.ipc.sendTo('moonlight-api', ['eval', code]);
			time = stopwatch.toString();
		} catch (error) {
			time = stopwatch.toString();
			result = error.error || error;
			success = false;
		}

		return message.send(`⏱ ${time} | **${success ? 'Output' : 'Error'}**${util.codeBlock('js', result)}`);
	}

}
