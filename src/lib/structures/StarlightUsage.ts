import { Command, CommandUsage } from 'klasa';

export class StarlightUsage extends CommandUsage {

	public constructor(command: Command, usageString: string, usageDelim: string | null, flags: Record<string, string | string[]> | null) {
		super(command.client, usageString, usageDelim, command);

		if (flags) {
			this.nearlyFullUsage = `${this.commands}${this.deliminatedUsage} [${StarlightUsage.resolveFlags(flags)}]`;
		}
	}

	private static resolveFlags(flags: Record<string, string | string[]>): string {
		const output: string[] = [];

		for (const [name, param] of Object.entries(flags)) {
			output.push(`--${name}${param === 'literal' ? '' : `=${Array.isArray(param) ? param.join('|') : param}`}`);
		}

		return output.join(' ');
	}

}
