import { StarlightCommand } from '../../../lib/structures/StarlightCommand';
import { ApplyOptions } from '../../../lib/util/Decorators';
import { CommandOptions, KlasaMessage, Piece } from 'klasa';

@ApplyOptions<CommandOptions>({
	permissionLevel: 10,
	guarded: true,
	description: (lang): string => lang.get('COMMAND_DISABLE_DESCRIPTION'),
	usage: '<Piece:piece>'
})
export default class extends StarlightCommand {

	public async run(message: KlasaMessage, [piece]: [Piece]): Promise<KlasaMessage> {
		if ((piece.type === 'event' && piece.name === 'coreMessage') || (piece.type === 'monitor' && piece.name === 'commandHandler')) {
			return message.sendLocale('COMMAND_DISABLE_WARN');
		}

		piece.disable();
		if (this.client.shard) {
			await this.client.shard.broadcastEval(`
					if (String(this.options.shards) !== '${this.client.options.shards}') this.${piece.store}.get('${piece.name}').disable();
			`);
		}

		return message.sendLocale('COMMAND_DISABLE', [piece.type, piece.name], { code: 'diff' });
	}

}
