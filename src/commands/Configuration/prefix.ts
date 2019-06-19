import { Command, CommandStore, KlasaMessage, Language } from 'klasa';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['setPrefix'],
            cooldown: 5,
            description: (lang: Language): string => lang.get('COMMAND_PREFIX_DESCRIPTION'),
            permissionLevel:0,
            runIn: ['text'],
            usage: '[reset|prefix:str{1,10}]'
        });
    }

    public async run(message: KlasaMessage, [prefix]: [string | 'reset']): Promise<KlasaMessage | KlasaMessage[]> {
        if (!prefix) return message.sendLocale('COMMAND_PREFIX_REMINDER', [message.guild!.settings.get('prefix')]);
        if (!await message.hasAtLeastPermissionLevel(6)) throw message.language.get('INHIBITOR_PERMISSIONS');
        if (prefix === 'reset') return this.reset(message);
        if (message.guild!.settings.get('prefix') === prefix) throw message.language.get('CONFIGURATION_EQUALS');
        await message.guild!.settings.update('prefix', prefix);
        return message.sendLocale('COMMAND_PREFIX_CHANGE', [prefix]);
    }

    private async reset(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        await message.guild!.settings.reset('prefix');
        return message.sendLocale('COMMAND_PREFIX_RESET');
    }
}