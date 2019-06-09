import { Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {
    public async run(msg: KlasaMessage): Promise<void> {
        if (msg.guild && msg.guild.settings.get('deleteCommand') as boolean && msg.deletable) await msg.delete();
    }
}