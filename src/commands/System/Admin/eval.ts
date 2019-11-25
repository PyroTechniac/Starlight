import { clean, codeBlock, isThenable, sleep } from '@klasa/utils';
import { codeblock } from 'discord-md-tags';
import { Command, CommandOptions, KlasaMessage, Stopwatch, Type } from 'klasa';
import { inspect } from 'util';
import { Events } from '../../../lib/types/Enums';
import { ApplyOptions } from '../../../lib/util/Decorators';
import { FetchType, noop } from '../../../lib/util/Utils';


@ApplyOptions<CommandOptions>({
	aliases: ['ev'],
	description: (lang): string => lang.get('COMMAND_EVAL_DESCRIPTION'),
	extendedHelp: (lang): string => lang.get('COMMAND_EVAL_EXTENDED'),
	guarded: true,
	permissionLevel: 10,
	usage: '<expression:string>',
	flagSupport: true
})
export default class extends Command {

	private readonly timeout = 60000;

	public async run(message: KlasaMessage, [code]: [string]): Promise<KlasaMessage | null> {
		const flagTime = 'no-timeout' in message.flagArgs ? 'wait' in message.flagArgs ? Number(message.flagArgs.wait) : this.timeout : Infinity;
		const language = message.flagArgs.lang || message.flagArgs.language || (message.flagArgs.json ? 'json' : 'js');
		const { success, result, time, type } = await this.timedEval(message, code, flagTime);

		if (message.flagArgs.silent) {
			if (!success && result && (result as unknown as Error).stack) this.client.emit(Events.Wtf, (result as unknown as Error).stack);
			return null;
		}

		const footer = codeblock('ts')`${type}`;
		const sendAs = message.flagArgs.output || message.flagArgs['output-to'] || (message.flagArgs.log ? 'log' : null);
		return this.handleMessage(message, { sendAs, hastebinUnavailable: false, url: null }, { success, result, time, footer, language });
	}

	private timedEval(message: KlasaMessage, code: string, flagTime: number): Promise<{
		success: boolean;
		time: string;
		type: Type;
		result: string;
	} | {
		result: string;
		success: boolean;
		time: string;
		type: string;
	}> {
		if (flagTime === Infinity || flagTime === 0) return this.eval(message, code);
		return Promise.race([
			sleep(flagTime).then(() => ({
				result: message.language.get('COMMAND_EVAL_TIMEOUT', flagTime / 1000),
				success: false,
				time: '⏱ ...',
				type: 'EvalTimeoutError'
			})),
			this.eval(message, code)
		]);
	}

	private async eval(message: KlasaMessage, code: string): Promise<{
		success: boolean;
		time: string;
		type: Type;
		result: string;
	}> {
		const stopwatch = new Stopwatch();
		let success: boolean;
		let syncTime: string;
		let asyncTime: string;
		let result: unknown;
		let thenable = false;
		let type: Type;
		try {
			if (message.flagArgs.async) code = `(async () => {\n${code}\n})();`;
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const msg = message;
			// eslint-disable-next-line no-eval
			result = eval(code);
			syncTime = stopwatch.toString();
			type = new Type(result);
			if (isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
			success = true;
		} catch (error) {
			if (!syncTime!) syncTime = stopwatch.toString();
			if (thenable && !asyncTime!) asyncTime = stopwatch.toString();
			if (!type!) type = new Type(error);
			result = error;
			success = false;
		}

		stopwatch.stop();
		if (typeof result !== 'string') {
			result = result instanceof Error
				? result.stack
				: message.flagArgs.json
					? JSON.stringify(result, null, 4)
					: inspect(result, {
						depth: message.flagArgs.depth ? Number.parseInt(message.flagArgs.depth, 10) || 0 : 0,
						showHidden: Boolean(message.flagArgs.showHidden)
					});
		}
		return { success, type: type!, time: this.formatTime(syncTime!, asyncTime!), result: clean(result as string) };
	}

	private formatTime(syncTime: string, asyncTime: string): string {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}

	private async getHaste(evalResult: string, language = 'js'): Promise<string> {
		const node = await this.client.cdn.acquire('https://hasteb.in/documents')
			.setOptions({ method: 'POST', body: evalResult })
			.setType(FetchType.JSON)
		// This should always fetch as the data changes on each eval.
			.fetch(true);

		const { key } = node.data<{ key: string }>()!;
		return `https://hasteb.in/${key}.${language}`;
	}

	private async handleMessage(message: KlasaMessage, options: InternalEvalOptions, { success, result, time, footer, language }: InternalEvalResults): Promise<KlasaMessage | null> {
		switch (options.sendAs) {
			case 'file': {
				if (message.channel.attachable) return message.channel.sendFile(Buffer.from(result), 'output.txt', message.language.get('COMMAND_EVAL_OUTPUT_FILE', time, footer));
				await this.getTypeOutput(message, options);
				return this.handleMessage(message, options, { success, result, time, footer, language });
			}
			case 'haste':
			case 'hastebin': {
				if (!options.url) options.url = await this.getHaste(result, language).catch(noop);
				if (options.url) return message.sendLocale('COMMAND_EVAL_OUTPUT_HASTEBIN', [time, options.url, footer]);
				options.hastebinUnavailable = true;
				await this.getTypeOutput(message, options);
				return this.handleMessage(message, options, { success, result, time, footer, language });
			}
			case 'console':
			case 'log': {
				this.client.emit(Events.Log, result);
				return message.sendLocale('COMMAND_EVAL_OUTPUT_CONSOLE', [time, footer]);
			}
			case 'abort':
			case 'none': {
				return null;
			}
			default: {
				if (result.length > 2000) {
					await this.getTypeOutput(message, options);
					return this.handleMessage(message, options, { success, result, time, footer, language });
				}

				return message.sendMessage(message.language.get(success ? 'COMMAND_EVAL_OUTPUT' : 'COMMAND_EVAL_ERROR',
					time, codeBlock(language, result), footer));
			}
		}
	}

	private async getTypeOutput(message: KlasaMessage, options: InternalEvalOptions): Promise<void> {
		const _options = ['none', 'abort', 'log'];
		if (message.channel.attachable) _options.push('file');
		if (!options.hastebinUnavailable) _options.push('hastebin');
		let _choice: { content: string };
		do {
			_choice = await message.prompt(`Choose one of the following options: ${_options.join(', ')}`).catch((): { content: string } => ({ content: 'none' }));
		}
		while (!_options.concat('none', 'abort').includes(_choice.content));
		options.sendAs = _choice.content.toLowerCase();
	}

}

interface InternalEvalResults {
	success: boolean;
	result: string;
	time: string;
	footer: string;
	language: string;
}

interface InternalEvalOptions {
	sendAs: string | null;
	hastebinUnavailable: boolean;
	url: string | null;
}
