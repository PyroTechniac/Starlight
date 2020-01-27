import { codeBlock, exec, sleep } from '@klasa/utils';
import { KlasaMessage } from 'klasa';
import { StarlightCommand, StarlightCommandOptions } from '../../../lib/structures/StarlightCommand';
import { ApplyOptions } from '../../../lib/util/Decorators';

@ApplyOptions<StarlightCommandOptions>({
	aliases: ['pull'],
	description: 'Update the bot.',
	guarded: true,
	usage: '[branch:string]'
})
export default class extends StarlightCommand {

	public async run(message: KlasaMessage, [branch = 'master']: [string?]): Promise<KlasaMessage> {
		await this.fetch(message, branch);
		return this.compile(message);
	}

	private async compile(message: KlasaMessage): Promise<KlasaMessage> {
		const { stderr } = await exec('yarn build')
			.catch((err): { stdout: string; stderr: string } => ({ stdout: '', stderr: (err?.message ?? err ?? '') }));
		if (stderr.length) throw stderr.trim();
		return message.send('✔ Successfully compiled.');
	}

	private async fetch(message: KlasaMessage, branch: string): Promise<KlasaMessage> {
		await exec('git fetch');
		const { stdout, stderr } = await exec(`git pull origin ${branch}`);

		if (stdout.includes('Already up-to-date.')) throw '✔ Up to date.';

		if (!this.isSuccessfulPull(stdout)) {
			if (!await this.isCurrentBranch(branch)) {
				return this.checkout(message, branch);
			}


			if (this.needsStash(stdout + stderr)) return this.stash(message);
		}

		return message.send(codeBlock('prolog', [stdout || '✔', stderr || '✔'].join('\n-=-=-=-\n')));
	}

	private async stash(message: KlasaMessage): Promise<KlasaMessage> {
		await message.send('Unsuccessful pull, stashing...');
		await sleep(1000);
		const { stdout, stderr } = await exec('git stash');
		if (!this.isSuccessfulStash(stdout + stderr)) {
			`Unsuccessful pull, stashing:\n\n${codeBlock('prolog', [stdout || '✔', stderr || '✔'].join('\n-=-=-=-\n'))}`;
		}

		return message.send(codeBlock('prolog', [stdout || '✔', stderr || '✔'].join('\n-=-=-=-\n')));
	}

	private async checkout(message: KlasaMessage, branch: string): Promise<KlasaMessage> {
		await message.send(`Switching to ${branch}...`);
		await exec(`git checkout ${branch}`);
		return message.send(`✔ Switched to ${branch}.`);
	}

	private async isCurrentBranch(branch: string): Promise<boolean> {
		const { stdout } = await exec('git symbolic-ref --short HEAD');
		return stdout === `refs/heads/${branch}\n` || stdout === `${branch}\n`;
	}

	private isSuccessfulPull(output: string): boolean {
		return /\d+\s*file\s*changed,\s*\d+\s*insertions?\([+-]\),\s*\d+\s*deletions?\([+-]\)/.test(output);
	}

	private isSuccessfulStash(output: string): boolean {
		return output.includes('Saved working directory and index state WIP on');
	}

	private needsStash(output: string): boolean {
		return output.includes('Your local changes to the following files would be overwritten by merge');
	}

}
