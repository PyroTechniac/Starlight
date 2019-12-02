import { ApplyOptions } from '../../lib/util/Decorators';
import { Command, CommandOptions, KlasaMessage } from 'klasa';
import { codeblock } from 'discord-md-tags';
import { exec } from '@klasa/utils';

@ApplyOptions<CommandOptions>({
	aliases: ['execute'],
	description: (lang): string => lang.get('COMMAND_EXEC_DESCRIPTION'),
	guarded: true,
	permissionLevel: 10,
	usage: '<expression:string>',
	extendedHelp: (lang): string => lang.get('COMMAND_EXEC_EXTENDED')
})
export default class extends Command {

	public async run(msg: KlasaMessage, [input]: [string]): Promise<KlasaMessage> {
		const lock = this.client.manager.createLock({
			caller: 'exec',
			unique: this.client.manager.createMetadataSymbol(`Exec(${msg.author.id}`),
			timeout: 60000
		});
		await msg.sendLocale('COMMAND_EXEC_AWAITING');

		const result = await exec(input, { timeout: 'timeout' in msg.flagArgs ? Number(msg.flagArgs.timeout) || 60000 : 60000 })
			.catch((err): { stdout: null; stderr: string } => ({ stdout: null, stderr: err }));

		const output = result.stdout ? `**\`OUTPUT\`**${codeblock('prolog')`${result.stdout}`}` : '';
		const outerr = result.stderr ? `**\`ERROR\`**${codeblock('prolog')`${result.stderr}`}` : '';

		lock();

		return msg.sendMessage([output, outerr].join('\n') || msg.language.get('COMMAND_EXEC_NO_OUTPUT'));
	}

}
