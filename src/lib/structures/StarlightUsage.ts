import { Command, CommandUsage } from 'klasa';
import { FlagData } from '../types/Interfaces';
import { filterArray } from '../util/Utils';

export class StarlightUsage extends CommandUsage {

	public constructor(command: Command, usageString: string, usageDelim: string | null, flags: Record<string, FlagData> | null) {
		super(command.client, usageString, usageDelim, command);

		if (flags) {
			this.nearlyFullUsage = `${this.commands}${this.deliminatedUsage} [${StarlightUsage.resolveFlags(flags)}]`;
		}
	}

	private static resolveFlags(flags: Record<string, FlagData>): string {
		const output: string[] = [];

		for (const [name, { type, aliases = [] }] of Object.entries(flags)) {
			const names = filterArray([name, ...aliases]).join('|');
			output.push(`--${names}${type === 'literal' ? '' : `=${Array.isArray(type) ? type.join('|') : type}`}`);
		}

		return output.join(' ');
	}

}
