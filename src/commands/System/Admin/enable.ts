import { StarlightCommand } from '../../../lib/structures/StarlightCommand';
import { ApplyOptions } from '../../../lib/util/Decorators';
import { CommandOptions, KlasaMessage, Piece } from 'klasa';

@ApplyOptions<CommandOptions>({
	permissionLevel: 10,
	guarded: true,
	description: (lang): string => lang.get('COMMAND_ENABLE_DESCRIPTION'),
	usage: '<Piece:piece>'
})
export default class extends StarlightCommand {

	public async run(message: KlasaMessage, [piece]: [Piece]): Promise<KlasaMessage> {
		piece.enable();
		if (this.client.shard) {
			await this.client.shard.broadcastEval(`
					if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.store}.get('${piece.name}').enable();
			`);
		}

		return message.sendLocale('COMMAND_ENABLE', [piece.type, piece.name], { code: 'diff' });
	}

}
