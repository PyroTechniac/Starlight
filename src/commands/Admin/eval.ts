import { Command, CommandOptions, Stopwatch, Type, util, Language, KlasaMessage } from 'klasa';
import { inspect } from 'util';
import { ApplyOptions } from '../../lib';

@ApplyOptions<CommandOptions>({
	aliases: ['ev'],
	permissionLevel: 10,
	guarded: true,
	description: (lang: Language): string => lang.get('COMMAND_EVAL_DESCRIPTION'),
	extendedHelp: (lang: Language): string => lang.get('COMMAND_EVAL_EXTENDEDHELP'),
	usage: '<expression:str>',
	usageDelim: undefined,
	flagSupport: true
})
export default class extends Command {

	public async run(message: KlasaMessage, [code]: [string]): Promise<KlasaMessage | KlasaMessage[] | null> {
		const { success, result, type, time } = await this.eval(message, code);
		const footer = util.codeBlock('ts', type);
		const output = message.language.get(success ? `COMMAND_EVAL_OUTPUT` : 'COMMAND_EVAL_ERROR',
			time, util.codeBlock('js', result), footer);
		if ('silent' in message.flags) return null;

		if (output.length > 2000) {
			if (message.guild && message.channel.attachable) {
				return message.channel.sendFile(Buffer.from(result), 'output.txt', message.language.get('COMMAND_EVAL_SENDFILE', time, footer));
			}
			this.client.emit('log', result);
			return message.sendLocale('COMMAND_EVAL_SENDCONSOLE', [time, footer]);
		}

		return message.sendMessage(output);
	}

	private async eval(message: KlasaMessage, code: string): Promise<{
		success: boolean;
		type: Type;
		time: string;
		result: string;
	}> {
		// @ts-ignore
		const msg = message; // eslint-disable-line @typescript-eslint/no-unused-vars
		const { flags } = message;
		code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
		const stopwatch = new Stopwatch();
		let success;
		let syncTime;
		let asyncTime;
		let type;
		let result;
		let thenable = false;
		try {
			if (flags.async) code = `(async () => {\n${code}\n})();`;
			// @ts-ignore
			result = this.client._eval(code);
			syncTime = stopwatch.toString();
			type = new Type(result);
			if (util.isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
			success = true;
		} catch (error) {
			if (!syncTime) syncTime = stopwatch.toString();
			if (!type) type = new Type(error);
			if (thenable && !asyncTime) asyncTime = stopwatch.toString();
			if (error && error.stack) this.client.emit('error', error.stack);
			result = error;
			success = false;
		}

		stopwatch.stop();
		if (typeof result !== 'string') {
			result = inspect(result, {
				depth: flags.depth ? Number(flags.depth) || 1 : 1,
				showHidden: Boolean(flags.showHidden)
			});
		}
		return { success, type, time: this.formatTime(syncTime, asyncTime), result: util.clean(result) };
	}

	private formatTime(syncTime: string, asyncTime: string): string {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}

}
