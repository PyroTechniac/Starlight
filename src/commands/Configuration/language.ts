import { Command, CommandStore, KlasaMessage, Language, Possible } from 'klasa';

export default class extends Command {
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['setLanguage', 'lang', 'setLang'],
            cooldown: 5,
            description: (language: Language): string => language.get('COMMAND_SET_LANGUAGE_DESCRIPTION'),
            permissionLevel: 0,
            runIn: ['text'],
            usage: '(reset|language:lang)'
        });

        this.createCustomResolver('lang', (arg: string, possible: Possible, message: KlasaMessage): string | Language => {
            if (arg === 'reset' || !arg) return arg;
            const lang = this.client.languages.get(arg);
            if (!lang) throw message.language.get('COMMAND_SET_LANGUAGE_NOLANG', arg, this.mappedLanguages);
            return lang;
        });
    }

    public async run(msg: KlasaMessage, [language]: ['reset' | Language]): Promise<KlasaMessage | KlasaMessage[]> {
        if (!language) return msg.sendLocale('COMMAND_SET_LANGUAGE_REMINDER', [msg.guild!.settings.get('language'), this.mappedLanguages]);
        if (!await msg.hasAtLeastPermissionLevel(6)) throw msg.language.get('INHIBITOR_PERMISSIONS');
        if (language === 'reset') return this.reset(msg);
        if (msg.guild!.settings.get('language') === language.name) throw msg.language.get('CONFIGURATION_EQUALS');
        await msg.guild!.settings.update('language', language.name);
        return msg.send(`The language for this guild has been set to \`${language}\``);
    }

    private async reset(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        await message.guild!.settings.reset('language');
        return message.send(`Switched the guild's language back to \`${message.guild!.settings.get('language')}\``);
    }

    private get mappedLanguages(): string {
        return this.client.languages.filter((lang): boolean => lang.enabled).map((filteredLang): string => `\`${filteredLang}\``).join(', ');
    }
}