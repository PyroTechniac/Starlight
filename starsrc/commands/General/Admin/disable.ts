import { Command, CommandStore, KlasaMessage, Language, Piece } from 'klasa';
import { ShardClientUtil } from 'kurasuta';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 10,
            guarded: true,
            description: (lang: Language): string => lang.get('COMMAND_DISABLE_DESCRIPTION'),
            usage: '<Piece:piece>'
        });
    }

    public async run(message: KlasaMessage, [piece]: [Piece]): Promise<KlasaMessage | KlasaMessage[]> {
        if ((piece.type === 'event' && piece.name === 'message') || (piece.type === 'monitor' && piece.name === 'commandHandler')) {
            return message.sendLocale('COMMAND_DISABLE_WARN');
        }

        piece.disable();
        if (this.client.shard) {
            await (this.client.shard as unknown as ShardClientUtil).broadcastEval(`
                if (String(this.shard.id) !== '${(this.client.shard as unknown as ShardClientUtil).id}') this.${piece.store}.get('${piece.name}').disable();
            `);
        }
        return message.sendLocale('COMMAND_DISABLE', [piece.type, piece.name], { code: 'diff' });
    }
}