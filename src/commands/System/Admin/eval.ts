import { Command, CommandStore, KlasaMessage, Language } from 'klasa';
import { util } from 'klasa';

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
        const { success, result, time, type } = await this.client.eval(message, code);
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
}