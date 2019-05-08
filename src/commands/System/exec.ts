import { Command, CommandStore, KlasaClient, KlasaMessage, util } from 'klasa';
const { exec, codeBlock } = util;

export default class ExecCommand extends Command {
    public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['execute'],
            description: 'Execute commands in the terminal, use with EXTREME CAUTION',
            guarded: true,
            permissionLevel: 10,
            usage: '<expression:string>',
            extendedHelp: 'Times out in 60 seconds by default. This can be changed with --timeout=TIME_IN_MILLISECONDS'
        });
    }

    public async run(message: KlasaMessage, [expression]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        await message.sendMessage('Executing your command...');

        const result = await exec(expression, { timeout: 'timeout' in message.flags ? Number(message.flags.timeout) : 60000 })
            .catch((error): any => ({ stdout: null, stderr: null }));
        const output = result.stdout ? `**\`OUTPUT\`**${codeBlock('prolog', result.stdout)}` : '';
        const outerr = result.stderr ? `**\`ERROR\`**${codeBlock('prolog', result.stderr)}` : '';
        
        return message.sendMessage([output, outerr].join('\n') || 'Done. There was no output to stdout or stderr');
    }
}