import { Command, CommandOptions, KlasaMessage, Language } from 'klasa';
import { ApplyOptions } from '../../../lib/util/Decorators';
import { writeHeapSnapshot } from 'v8';

@ApplyOptions<CommandOptions>({
	permissionLevel: 10,
	guarded: true,
	description: (lang: Language): string => lang.get('COMMAND_HEAPSNAPSHOT_DESCRIPTION'),
	extendedHelp: (lang: Language): string => lang.get('COMMAND_HEAPSNAPSHOT_EXTENDEDHELP')
})
export default class extends Command {

	public async run(msg: KlasaMessage): Promise<KlasaMessage> {
		await msg.sendLocale('COMMAND_HEAPSNAPSHOT_CAPTURING', [this.client.cache.usage]);

		const path = writeHeapSnapshot();

		return msg.sendLocale('COMMAND_HEAPSNAPSHOT_CAPTURED', [path]);
	}

}
