import { KlasaClient, CommandStore, Command, Stopwatch, Type, util } from 'klasa';
import { inspect } from 'util';
import { KlasaMessage } from 'klasa';

export default class EvalCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['ev'],
            permissionLevel: 10,
            guarded: true,
            description: 'Evaluates arbitrary JavaScript',
            usage: '<expression:string>'
        });
    }

    public async run(msg: KlasaMessage, [expression]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { success, result, inspected, time, type } = await this.eval(msg, expression);
        const footer = util.codeBlock('ts', type);
        const silent = 'silent' in msg.flags;

        const output = this.client.util.embed()
            .setColor(success ? 0x00ff00 : 0xff0000)
            .addField('Evaluates to: ', result)
            .addField(`${success ? 'Inspect' : 'Error'}: `, util.codeBlock('js', inspected))
            .addField('Type:', util.codeBlock('ts', type))
            .setFooter(time);

        if (!success) {
            if (result && (result as unknown as Error).stack) this.client.emit('error', (result as unknown as Error).stack);
            if (!silent) return msg.sendMessage(output);
        }

        if (inspected.length > 1000) {
            if (msg.guild && msg.channel.attachable) {
                return msg.channel.sendFile(Buffer.from(inspected), 'output.txt', msg.language.get('COMMAND_EVAL_SENDFILE', time, footer));
            }
            this.client.emit('log', result);
            return msg.sendMessage(msg.language.get('COMMAND_EVAL_SENDCONSOLE', time, footer));
        }
        return msg.sendEmbed(output);
    }

    private async eval(message: KlasaMessage, code: string): Promise<any> {
        const msg = message;
        const stopwatch = new Stopwatch();
        let success, syncTime, asyncTime, result, inspected;
        let thenable = false;
        let type;
        try {
            if (message.flags.async) code = `(async () => { ${code} })()`;
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
            result = error;
            success = false;
        }
        stopwatch.stop();
        if (success && typeof result !== 'string') {
            inspected = inspect(result, {
                depth: message.flags.depth ? Number.parseInt(message.flags.depth) || 0 : 0,
                showHidden: Boolean(message.flags.showHidden)
            });
        } else {
            inspected = result.stack || result;
        }
        return { success, type, time: this.formatTime(syncTime, asyncTime), inspected, result: util.clean(String(result)) };
    }

    private formatTime(syncTime: any, asyncTime: any): string {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
    }
}