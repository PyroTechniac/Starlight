import { Command, CommandStore, Language, KlasaMessage } from 'klasa';
import { join } from 'path';
import { writeSnapshot as writeSnapshotSync } from 'heapdump';
import { promisify } from 'util';
const writeSnapshot = promisify(writeSnapshotSync);

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 10,
            guarded: true,
            description: (lang: Language): string => lang.get('COMMAND_HEAPDUMP_DESCRIPTION'),
            extendedHelp: (lang: Language): string => lang.get('COMMAND_HEAPDUMP_EXTENDEDHELP'),
            aliases: ['heapdump']
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        await msg.send('Capturing HEAP Snapshot. This may take a while...');

        const path = join(process.cwd(), `${Date.now()}.heapsnapshot`);
        // @ts-ignore util.promisify causes this to think it doesn't take any args
        await writeSnapshot(path);

        return msg.send(`Captured in \`${path}\`, check! Remember, do NOT share this with anybody, it may contain lots of sensitive data.`);
    }
}