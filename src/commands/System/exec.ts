import { Command, util, CommandStore, KlasaMessage } from 'klasa';
const { exec, codeBlock } = util;

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['execute'],
            description: 'Execute commands in the terminal, use with EXTREME_CAUTION.',
            guarded: true,
            permissionLevel: 10,
            usage: '<expression:string>',
            extendedHelp: 'Times out in 60 seconds by default. This can be changed with --timeout=TIME_IN_MILLISECONDS.'
        });
    }

    public async run(msg: KlasaMessage, [input]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        await msg.send('Executing your command...');

        const result = await exec(input, { timeout: 'timeout' in msg.flags ? Number(msg.flags.timeout) : 60000 })
            .catch((err): any => ({ stdout: null, stderr: err }));
        const output = result.stdout ? `**\`OUTPUT\`**${codeBlock('prolog', result.stdout)}` : '';
        const outerr = result.stderr ? `**\`ERROR\`**${codeBlock('prolog', result.stderr)}` : '';

        return msg.send([output, outerr].join('\n') || 'Done. There was no output to stdout or stderr.');
    }
}