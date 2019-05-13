import { Finalizer, KlasaMessage } from 'klasa';

export default class DeleteCommandFinalizer extends Finalizer {
    public async run(msg: KlasaMessage): Promise<void> {
        if (msg.guild && msg.guild!.settings.get('deleteCommand') && msg.deletable) await msg.delete();
    }
}