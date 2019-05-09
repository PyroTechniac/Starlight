import { Command, CommandStore, Type, util, KlasaClient, Stopwatch } from 'klasa';
import { inspect } from 'util';
import fetch from 'node-fetch';
import { Language } from 'klasa';
import { KlasaMessage } from 'klasa';

export default class EvalCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['ev'],
            description: (language): string => language.get('COMMAND_EVAL_DESCRIPTION'),
            extendedHelp: [
                'The eval command evaluates code as-in, any error thrown from it will be handled.',
                'It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.',
                'The --wait flag changes the time the eval will run. Defaults to 10 seconds. Accepts time in milliseconds.',
                'The --output and --output-to flag accept either \'file\', \'log\', \'haste\' or \'hastebin\'.',
                'The --delete flag makes the command delete the message that executed the message after evaluation.',
                'The --silent flag will make it output nothing.',
                'The --depth flag accepts a number, for example, --depth=2, to customize util.inspect\'s depth.',
                'The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword',
                'The --showHidden flag will enable the showHidden option in util.inspect.',
                'The --lang and --language flags allow different syntax highlight for the output.',
                'The --json flag converts the output to json',
                'The --no-timeout flag disables the timeout',
                'If the output is too large, it\'ll send the output as a file, or in the console if the bot does not have the ATTACH_FILES permission.'
            ].join('\n'),
            guarded: true,
            permissionLevel: 10,
            usage: '<expression:str>'
        });
    }

    private timeout: number = 30000;

    public async run(msg: KlasaMessage, [code]: [string]): Promise<any> {
        const flagTime = 'no-timeout' in msg.flags ? 'wait' in msg.flags ? Number(msg.flags.wait) : this.timeout : Infinity;
        const language = msg.flags.lang || msg.flags.language || (msg.flags.json ? 'json' : 'js');
        const { success, result, time, type } = await this.timedEval(msg, code, flagTime);
        if (msg.flags.silent) {
            if (!success && result && (result as any).stack) this.client.emit('error', (result as any).stack);
            return null;
        }
        const footer = util.codeBlock('ts', type);
        const sendAs = msg.flags.output || msg.flags['output-to'] || (msg.flags.log ? 'log' : null);
        return this.handleMessage(msg, { sendAs, hastebinUnavailable: false, url: null }, { success, result, time, footer, language });
    }

    private async handleMessage(msg: KlasaMessage, options: any, { success, result, time, footer, language }: any): Promise<any> {
        switch (options.sendAs) {
            case 'file': {
                if (msg.channel.attachable) return msg.channel.sendFile(Buffer.from(result), 'output.txt', `Sent the result as a file.\n**Type**:${footer}\n${time}`);
                await this.getTypeOutput(msg, options);
                return this.handleMessage(msg, options, { success, result, time, footer, language });
            }
            case 'haste':
            case 'hastebin': {
                if (!options.url) options.url = await this.getHaste(result, language).catch((): null => null);
                if (options.url) return msg.sendMessage(`Sent the result to hastebin: ${options.url}\n**Type**:${footer}\n${time}\n`);
                options.hastebinUnavailable = true;
                await this.getTypeOutput(msg, options);
                return this.handleMessage(msg, options, { success, result, time, footer, language });
            }
            case 'console':
            case 'log': {
                this.client.emit('log', result);
                return msg.sendMessage(`Sent the result to console.\n**Type**:${footer}\n${time}`);
            }
            case 'none':
                return null;
            default: {
                if (result.length > 2000) {
                    await this.getTypeOutput(msg, options);
                    return this.handleMessage(msg, options, { success, result, time, footer, language });
                }
                return msg.sendMessage(success ? `**Output**:${util.codeBlock(language, result)}\n**Type**:${footer}\n${time}` : `**Error**:${util.codeBlock(language, result)}\n**Type**:${footer}\n${time}`);
            }
        }
    }

    private async getTypeOutput(msg: KlasaMessage, options: any): Promise<void> {
        const _options = ['log'];
        if (msg.channel.attachable) _options.push('file');
        if (!options.hastebinUnavailable) _options.push('hastebin');
        let _choice;
        do {
            _choice = await msg.prompt(`Choose one of the following options: ${_options.join(', ')}`).catch((): { content: string } => ({ content: 'none' }));
        } while (!['file', 'haste', 'hastebin', 'console', 'log', 'default', 'none', null].includes(_choice.content));
        options.sendAs = _choice.content;
    }

    private timedEval(msg: KlasaMessage, code: string, flagTime: number): Promise<{
        success: any;
        type: any;
        time: string;
        result: string;
    }> {
        if (flagTime === Infinity || flagTime === 0) return this.eval(msg, code);
        return Promise.race([
            util.sleep(flagTime).then((): any => ({
                success: false,
                result: `TIMEOUT: Took longer than ${flagTime / 1000} seconds`,
                time: '⏱ ...',
                type: 'EvalTimeoutError'
            })),
            this.eval(msg, code)
        ]);
    }

    private async eval(msg: KlasaMessage, code: string): Promise<{
        success: any;
        type: any;
        time: string;
        result: string;
    }> {
        const stopwatch = new Stopwatch();
        let success, syncTime, asyncTime, result;
        let thenable = false;
        let type;

        try {
            if (msg.flags.async) code = `(async () => {\n${code}\n})();`;
            result = eval(code);
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
            if (thenable && !asyncTime) asyncTime = stopwatch.toString();
            if (!type) type = new Type(error);
            result = error;
            success = false;
        }

        stopwatch.stop();
        if (typeof result !== 'string') {
            result = result instanceof Error ? result.stack : msg.flags.json ? JSON.stringify(result, null, 4) : inspect(result, {
                depth: msg.flags.depth ? Number.parseInt(msg.flags.depth) || 0 : 0,
                showHidden: Boolean(msg.flags.showHidden)
            });
        }

        return { success, type, time: this.formatTime(syncTime, asyncTime), result: util.clean(result) };
    }

    private formatTime(syncTime: string | number, asyncTime: string | number): string {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
    }

    private async getHaste(evalResult, language: string): Promise<string> {
        const key = await fetch('https://hastebin.com/documents', { method: 'POST', body: evalResult })
            .then((res): any => res.json())
            .then((body): string => body.key);
        return `https://hastebin.com/${key}.${language}`;
    }
}