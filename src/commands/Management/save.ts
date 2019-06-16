import { Command, CommandStore, Language, KlasaMessage } from 'klasa';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            runIn: ['text'],
            description: (lang: Language): string => lang.get('COMMAND_SAVE_DESCRIPTION'),
            permissionLevel: 6,
            cooldownLevel: 'guild',
            cooldown: 1800,
            bucket: 1
        });
    }

    public async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        return message.send('Saving settings...');
    }
}