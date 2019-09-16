import { Stopwatch, Type, util, CommandOptions, Language, KlasaMessage } from 'klasa';
import { StarlightCommand, ApplyOptions, Events } from '../../lib';
import { inspect } from 'util';

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
export default class extends StarlightCommand<{
	result: string;
	type: Type;
	time: string;
	success: boolean;
}> {

	public async execute(message: KlasaMessage, [response]: [{
		result: string;
		type: Type;
		time: string;
		success: boolean;
	}]): Promise<KlasaMessage | KlasaMessage[] | null> {
		const { success, result, time, type } = response;
		const footer = util.codeBlock('ts', type);
		const output = message.language.get(success ? 'COMMAND_EVAL_OUTPUT' : 'COMMAND_EVAL_ERROR',
			time, util.codeBlock('js', result), footer);

		if ('silent' in message.flags) return null;

		if (output.length > 2000) {
			if (message.guild && message.channel.attachable) {
				return message.channel.sendFile(Buffer.from(result), 'output.txt', message.language.get('COMMAND_EVAL_SENDFILE', time, footer));
			}
			this.client.emit(Events.Log, result);
			return message.sendLocale('COMMAND_EVAL_SENDCONSOLE', [time, footer]);
		}

		return message.sendMessage(output);
	}

	public async preRun(message: KlasaMessage, [code]: [string]): Promise<{
		result: string;
		type: Type;
		time: string;
		success: boolean;
	}> {
		// @ts-ignore
		const msg = message; // eslint-disable-line @typescript-eslint/no-unused-vars
		const { flags } = message;

		code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
		const stopwatch = new Stopwatch();
		let success: boolean;
		let syncTime: string;
		let asyncTime: string;
		let result: string;
		let thenable = false;
		let type: Type;
		try {
			if (flags.async) code = `(async () => {\n${code}\n})();`;
			result = eval(code); // eslint-disable-line no-eval
			syncTime = stopwatch.toString();
			type = new Type(result);
			if (util.isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
			success = true;
		} catch (err) {
			if (!syncTime!) syncTime = stopwatch.toString();
			if (!type!) type = new Type(err);
			if (thenable && !asyncTime!) asyncTime = stopwatch.toString();
			if (err && (err as Error).stack) this.client.emit(Events.Error, err.stack);
			result = err;
			success = false;
		}

		stopwatch.stop();
		if (typeof result !== 'string') {
			result = inspect(result, {
				depth: flags.depth ? Number(flags.depth) || 0 : 0,
				showHidden: Boolean(flags.showHidden)
			});
		}

		return {
			success,
			type: type!,
			time: this.formatTime(syncTime!, asyncTime!),
			result: util.clean(result)
		};
	}

	private formatTime(syncTime: string, asyncTime: string): string {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}

}
