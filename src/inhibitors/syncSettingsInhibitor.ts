import { InhibitorOptions, Inhibitor, KlasaMessage } from 'klasa'
import { ApplyOptions } from '../lib/util/Decorators';

@ApplyOptions<InhibitorOptions>({
    spamProtection: true
})
export default class extends Inhibitor {
    public async run(message: KlasaMessage): Promise<void> {
        const userSync = message.author.settings.sync();
        const guildSync = message.guild ? message.guild.settings.sync() : Promise.resolve(null);

        await Promise.all([userSync, guildSync]);
    }
}