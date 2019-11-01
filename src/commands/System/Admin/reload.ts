import { StarlightCommand } from '../../../lib/structures/StarlightCommand';
import { ApplyOptions } from '../../../lib/util/Decorators';
import { CommandOptions, Store, Stopwatch, KlasaMessage, Piece } from 'klasa';

@ApplyOptions<CommandOptions>({
	aliases: ['r'],
	permissionLevel: 10,
	guarded: true,
	description: (lang): string => lang.get('COMMAND_RELOAD_DESCRIPTION'),
	usage: '<Store:store|Piece:piece|everything:default>'
})
export default class extends StarlightCommand {

	public async run(message: KlasaMessage, [piece]: [Piece | Store<string, Piece, typeof Piece> | 'everything']): Promise<KlasaMessage> {
		if (piece === 'everything') return this.everything(message);
		if (piece instanceof Store) {
			const timer = new Stopwatch();
			await piece.loadAll();
			await piece.init();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
						if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.name}.loadAll().then(() => this.${piece.name}.init());
				`);
			}
			return message.sendLocale('COMMAND_RELOAD_ALL', [piece, timer.stop()]);
		}

		try {
			const itm = await piece.reload();
			const timer = new Stopwatch();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
						if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.store}.get('${piece.name}').reload();
				`);
			}
			return message.sendLocale('COMMAND_RELOAD', [itm.type, itm.name, timer.stop()]);
		} catch (err) {
			piece.store.set(piece);
			return message.sendLocale('COMMAND_RELOAD_FAILED', [piece.type, piece.name]);
		}
	}

	private async everything(message: KlasaMessage): Promise<KlasaMessage> {
		const timer = new Stopwatch();
		await Promise.all(this.client.pieceStores.map(async (store: Store<string, Piece, typeof Piece>): Promise<void> => {
			await store.loadAll();
			await store.init();
		}));
		if (this.client.shard) {
			await this.client.shard.broadcastEval(`
					if (String(this.options.shard) !== '${this.client.options.shards}') this.pieceStores.map(async (store) => {
						await store.loadAll();
						await store.init();
					});
			`);
		}

		return message.sendLocale('COMMAND_RELOAD_EVERYTHING', [timer.stop()]);
	}

}
