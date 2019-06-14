import { Command, CommandStore, Language, KlasaMessage, Stopwatch, Type, util } from 'klasa';
import { inspect } from 'util';

export interface EvalOutput {
    success: boolean;
    type: Type;
    time: string;
    result: string;
}

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['ev'],
            permissionLevel: 10,
            guarded: true,
            description: (lang: Language): string => lang.get('COMMAND_EVAL_DESCRIPTION'),
            extendedHelp: (lang: Language): string => lang.get('COMMAND_EVAL_EXTENDEDHELP'),
            usage: '<expression:str>'
        });
    }

    public async run(message: KlasaMessage, [code]: [string]): Promise<KlasaMessage | KlasaMessage[] | null> {
        const { success, result, time, type } = await this.eval(message, code);
        const footer = util.codeBlock('ts', type);
        const output = message.language.get(success ? 'COMMAND_EVAL_OUTPUT' : 'COMMAND_EVAL_ERROR',
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

    private async eval(message: KlasaMessage, code: string): Promise<EvalOutput> {
        const msg = message;
        const { flags } = message;
        code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, '\'');
        const stopwatch = new Stopwatch();
        let success: boolean, syncTime: string, asyncTime: string, result: any;
        let thenable = false;
        let type: Type;
        try {
            if (flags.async) code = `(async () => {\n${code}\n})()`;
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
            if (!syncTime!) syncTime = stopwatch.toString();
            if (!type!) type = new Type(error);
            if (thenable && !asyncTime!) asyncTime = stopwatch.toString();
            if (error && error.stack) this.client.emit('error', error.stack);
            result = error;
            success = false;
        }

        stopwatch.stop();
        if (typeof result !== 'string') {
            result = inspect(result, {
                depth: flags.depth ? Number.parseInt(flags.depth) || 0 : 0,
                showHidden: Boolean(flags.showHidden)
            });
        }

        return { success, type: type!, time: this.formatTime(syncTime!, asyncTime!), result: util.clean(result!) };
    }

    private formatTime(syncTime: string, asyncTime: string): string {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
    }
}