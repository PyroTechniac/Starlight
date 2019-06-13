import { Language, Command, KlasaMessage, CommandStore } from 'klasa';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 10,
            guarded: true,
            description: (lang: Language): string => lang.get('COMMAND_REBOOT_DESCRIPTION')
        });
    }

    public async run(message: KlasaMessage): Promise<never> {
        await message.sendLocale('COMMAND_REBOOT').catch((err): boolean => this.client.emit('error', err));
        await Promise.all(this.client.providers.map((provider): Promise<void> => provider.shutdown()));
        return process.exit();
    }
}