import { StarlightCommand } from '../../../lib/structures/StarlightCommand';
import { ApplyOptions } from '../../../lib/util/Decorators';
import { CommandOptions, KlasaMessage, Piece, Stopwatch, Store } from 'klasa';
import { pathExists } from 'fs-nextra';
import { join } from 'path';

@ApplyOptions<CommandOptions>({
	aliases: ['l'],
	permissionLevel: 10,
	guarded: true,
	description: (lang): string => lang.get('COMMAND_LOAD_DESCRIPTION'),
	usage: '[core] <Store:store> <path:...string>',
	usageDelim: ' '
})
export default class extends StarlightCommand {

	private regExp = /\\\\?|\//g;

	public async run(message: KlasaMessage, [core, store, path]: ['core' | undefined, Store<string, Piece, typeof Piece>, string]): Promise<KlasaMessage> {
		const splitPath = (path.endsWith('.js') ? path : `${path}.js`).split(this.regExp);
		const timer = new Stopwatch();
		const piece = await (core ? this.tryEach(store, splitPath) : store.load(store.userDirectory, splitPath));

		try {
			if (!piece) throw message.language.get('COMMAND_LOAD_FAIL');
			await piece.init();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
						if (String(this.options.shard) !== '${this.client.options.shards}') {
							const piece = this.${piece.store}.load('${piece.directory}', ${JSON.stringify(splitPath)});
							if (piece) piece.init();
						}
				`);
			}
			return message.sendLocale('COMMAND_LOAD', [timer.stop(), store.name, piece.name]);
		} catch (error) {
			timer.stop();
			throw message.language.get('COMMAND_LOAD_ERROR', store.name, piece ? piece.name : splitPath.join('/'), error);
		}
	}

	private async tryEach(store: Store<string, Piece, typeof Piece>, path: string[]): Promise<Piece | undefined> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		for (const dir of store.coreDirectories) if (await pathExists(join(dir, ...path))) return store.load(dir, path);
		return undefined;
	}

}
