import { Command, util, CommandStore, KlasaMessage } from 'klasa';

const { exec, codeBlock } = util;

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['execute', 'ex'],
            description: 'Execute commands in the terminal, use with EXTREME CAUTION.',
            guarded: true,
            permissionLevel: 10,
            usage: '<expression:string>',
            extendedHelp: 'Times out in 60 seconds by default. This can be changed with --timeout=TIME_IN_MILLISECONDS'
        });
    }

    public async run(msg: KlasaMessage, [input]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        await msg.sendMessage('Executing your command...');

        const result = await exec(input, { timeout: 'timeout' in msg.flags ? Number(msg.flags.timeout) || 60000 : 60000 })
            .catch((error): { stdout: null; stderr: any } => ({ stdout: null, stderr: error }));
        const output = result.stdout ? `**\`OUTPUT\`**${codeBlock('prolog', result.stdout)}` : '';
        const outerr = result.stderr ? `**\`ERROR\`**${codeBlock('prolog', result.stderr)}` : '';

        return msg.sendMessage([output, outerr].join('\n') || 'Done. There was no output to stdout or stderr.');
    }
}