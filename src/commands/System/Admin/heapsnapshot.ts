import { ApplyOptions, requiresDMContext } from '../../../lib/util/Decorators';
import { writeSnapshot as writeSnapshotSync } from 'heapdump';
import { Command, CommandOptions, KlasaMessage, Language } from 'klasa';
import { join } from 'path';
import { promisify } from 'util';

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
		await msg.sendLocale('COMMAND_HEAPSNAPSHOT_CAPTURING', [(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)]);
		const path = join(process.cwd(), `${Date.now()}.heapsnapshot`);
		await writeSnapshot(path);

		return msg.sendLocale('COMMAND_HEAPSNAPSHOT_CAPTURED', [path]);
	}

}
