import { ApplyOptions } from '../../lib/util/Decorators';
import { Command, CommandOptions, KlasaMessage, util } from 'klasa';
const { codeBlock, exec } = util;

@ApplyOptions<CommandOptions>({
	aliases: ['execute'],
	description: 'Execute commands in the terminal, use with EXTREME CAUTION', // TODO: Move this to the lang file
	guarded: true,
	permissionLevel: 10,
	usage: '<expression:string>',
	extendedHelp: 'Times out in 60 seconds by default. This can be changed with --timeout=TIME_IN_MILLISECONDS' // TODO: Also move this
})
export default class extends Command {

	public async run(msg: KlasaMessage, [input]: [string]): Promise<KlasaMessage> {
		await msg.sendLocale('COMMAND_EXEC_AWAITING');

		const result = await exec(input, { timeout: 'timeout' in msg.flagArgs ? Number(msg.flagArgs.timeout) || 60000 : 60000 })
			.catch((err): { stdout: null; stderr: string } => ({ stdout: null, stderr: err }));

		const output = result.stdout ? `**\`OUTPUT\`**${codeBlock('prolog', result.stdout)}` : '';
		const outerr = result.stderr ? `**\`ERROR\`**${codeBlock('prolog', result.stderr)}` : '';

		return msg.sendMessage([output, outerr].join('\n') || msg.language.get('COMMAND_EXEC_NO_OUTPUT'));
	}

}
