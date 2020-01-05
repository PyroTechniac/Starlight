import { ApplyOptions, botOwner } from '../../lib/util/Decorators';
import { CommandOptions, KlasaMessage } from 'klasa';
import { exec } from '@klasa/utils';
import { codeblock } from '../../lib/util/Markdown';
import { StarlightCommand } from '../../lib/structures/StarlightCommand';

@ApplyOptions<CommandOptions>({
	aliases: ['execute'],
	description: (lang): string => lang.get('COMMAND_EXEC_DESCRIPTION'),
	guarded: true,
	usage: '<expression:string>',
	extendedHelp: (lang): string => lang.get('COMMAND_EXEC_EXTENDED'),
	flags: {
		timeout: {
			type: 'number'
		}
	}
})
export default class extends StarlightCommand {

	@botOwner()
	public async run(msg: KlasaMessage, [input]: [string]): Promise<KlasaMessage> {
		await msg.sendLocale('COMMAND_EXEC_AWAITING');

		const result = await exec(input, { timeout: 'timeout' in msg.flagArgs ? Number(msg.flagArgs.timeout) || 60000 : 60000 })
			.catch((err): { stdout: null; stderr: string } => ({ stdout: null, stderr: err }));

		const output = result.stdout ? `**\`OUTPUT\`**${codeblock('prolog')`${result.stdout}`}` : '';
		const outerr = result.stderr ? `**\`ERROR\`**${codeblock('prolog')`${result.stderr}`}` : '';

		return msg.sendMessage([output, outerr].join('\n') || msg.language.get('COMMAND_EXEC_NO_OUTPUT'));
	}

}
