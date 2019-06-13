import { Command, CommandStore, Stopwatch, KlasaMessage, Language } from 'klasa';
import { pathExists } from 'fs-nextra';
import { join } from 'path';
import { Store } from 'klasa';
import { Piece } from 'klasa';
import string from '../../../serializers/string';
import { ShardClientUtil } from 'kurasuta';

export default class extends Command {
    public constructor(store, file, directory) {
        super(store, file, directory, {
            aliases: ['l'],
            permissionLevel: 10,
            guarded: true,
            description: (lang: Language): string => lang.get('COMMAND_LOAD_DESCRIPTION'),
            usage: '[core] <Store:store> <path:...string>',
            usageDelim: ' '
        });
    }

    private regex: RegExp = /\\\\?|\//g;

    public async run(message: KlasaMessage, [core, store, path]: ['core' | undefined, Store<string, Piece, typeof Piece>, string | string[]]): Promise<KlasaMessage | KlasaMessage[]> {
        path = (((path as string).endsWith('.js') ? path : `${path}.js`) as string).split(this.regex);
        const timer = new Stopwatch();
        const piece = await (core ? this.tryEach(store, path) : store.load(store.userDirectory, path));

        try {
            if (!piece) throw message.language.get('COMMAND_LOAD_FAIL');
            await piece.init();
            if (this.client.shard) {
                await (this.client.shard as unknown as ShardClientUtil).broadcastEval(`
                    if (String(this.shard.id) !== '${(this.client.shard as unknown as ShardClientUtil).id}') {
                        const piece = this.${piece.store}.load('${piece.directory}', ${JSON.stringify(path)});
                        if (piece) piece.init();
                    }
                `);
            }
            return message.sendLocale('COMMAND_LOAD', [timer.stop(), store.name, piece.name]);
        } catch (error) {
            timer.stop();
            throw message.language.get('COMMAND_LOAD_ERROR', store.name, piece ? piece.name : path.join('/'), error);
        }
    }

    private async tryEach(store: Store<string, Piece, typeof Piece>, path: string[]): Promise<Piece | undefined> {
        // @ts-ignore
        for (const dir of store.coreDirectories) if (await pathExists(join(dir, ...path))) return store.load(dir, path);
        return undefined;
    }
}