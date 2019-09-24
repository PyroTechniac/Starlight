import { Command, CommandOptions, Language, KlasaMessage } from 'klasa';
import { ApplyOptions, requiresDMContext } from '../../../lib';
import { promisify } from 'util';
import { writeSnapshot as writeSnapshotSync } from 'heapdump';
import { join } from 'path';

const writeSnapshot = promisify(writeSnapshotSync) as (path: string) => Promise<void>;

@ApplyOptions<CommandOptions>({
	permissionLevel: 10,
	guarded: true,
	description: (lang: Language): string => lang.get('COMMAND_HEAPSNAPSHOT_DESCRIPTION'),
	extendedHelp: (lang: Language): string => lang.get('COMMAND_HEAPSNAPSHOT_EXTENDEDHELP')
})
export default class extends Command {

    @requiresDMContext()
	public async run(msg: KlasaMessage): Promise<KlasaMessage> {
		await msg.sendMessage(`Capturing HEAP Snapshot, this may take a while. RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);

		const path = join(process.cwd(), `${Date.now()}.heapsnapshot`);
		await writeSnapshot(path);

		return msg.sendMessage(`Captured in \`${path}\`, check! Remember, do NOT share this with anybody, it may contain a lot of sensitive data.`);
	}

}
