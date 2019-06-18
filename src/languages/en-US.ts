import { Language, LanguageStore } from 'klasa';

export default class extends Language {
    public constructor(store: LanguageStore, file: string[], directory: string) {
        super(store, file, directory);

        this.language = {
            COMMAND_SET_DESCRIPTION: 'Used to manage a guild. Sets a name of whatever subcommand is used.'
        };
    }
}