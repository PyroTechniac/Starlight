import { Command, CommandOptions, KlasaMessage } from 'klasa';
import { ApplyOptions } from '../../../lib/util/Decorators';
import { Events } from '../../../lib/types/Enums';

@ApplyOptions<CommandOptions>({
    description: (lang): string => lang.get('COMMAND_REBOOT_DESCRIPTION'),
    guarded: true,
    permissionLevel: 10
})
export default class extends Command {
    public async run(message: KlasaMessage): Promise<never> {
        await message.sendLocale('COMMAND_REBOOT').catch((err): boolean => this.client.emit(Events.Wtf, err));

        try {
            await Promise.all(this.client.providers.map((provider): Promise<unknown> => provider.shutdown()));
            this.client.destroy()
        } catch { }

        return process.exit();
    }
}