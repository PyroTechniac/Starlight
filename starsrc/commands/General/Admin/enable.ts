import { Command, CommandStore, KlasaMessage, Language, Piece } from 'klasa';
import { ShardClientUtil } from 'kurasuta';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 10,
            guarded: true,
            description: (lang: Language): string => lang.get('COMMAND_ENABLE_DESCRIPTION'),
            usage: '<Piece:piece>'
        });
    }

    public async run(message: KlasaMessage, [piece]: [Piece]): Promise<KlasaMessage | KlasaMessage[]> {
        piece.enable();
        if (this.client.shard) {
            await (this.client.shard as unknown as ShardClientUtil).broadcastEval(`
                if (String(this.shard.id) !== '${(this.client.shard as unknown as ShardClientUtil).id}') this.${piece.store}.get('${piece.name}').enable();
            `);
        }
        return message.sendCode('diff', message.language.get('COMMAND_ENABLE', piece.type, piece.name));
    }
}