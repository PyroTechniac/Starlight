import { StarlightCommand } from '../../../lib/structures/StarlightCommand';
import { ApplyOptions } from '../../../lib/util/Decorators';
import { Events } from '../../../lib/types/Enums';
import { CommandOptions, KlasaMessage, Piece } from 'klasa';
import { join, resolve } from 'path';
import { access, copy } from 'fs-nextra';

@ApplyOptions<CommandOptions>({
	permissionLevel: 10,
	guarded: true,
	description: (lang): string => lang.get('COMMAND_TRANSFER_DESCRIPTION'),
	usage: '<Piece:piece>'
})
export default class extends StarlightCommand {

	public async run(message: KlasaMessage, [piece]: [Piece]): Promise<KlasaMessage> {
		const file = join(...piece.file);
		const fileLocation = resolve(piece.directory, file);
		await access(fileLocation).catch((): never => {
			throw message.language.get('COMMAND_TRANSFER_ERROR');
		});
		try {
			await copy(fileLocation, join(piece.store.userDirectory, file));
			piece.store.load(piece.store.userDirectory, piece.file);
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
						if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.store}.load(${piece.store.userDirectory}, ${JSON.stringify(piece.file)});
				`);
			}

			return message.sendLocale('COMMAND_TRANSFER_SUCCESS', [piece.type, piece.name]);
		} catch (error) {
			this.client.emit(Events.Error, error.stack);
			return message.sendLocale('COMMAND_TRANSFER_FAILED', [piece.type, piece.name]);
		}
	}

}
