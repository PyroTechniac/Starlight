import {Language, util, KlasaClient, LanguageStore} from 'klasa';

export default class EnglishLanguage extends Language {
    public constructor(client: KlasaClient, store: LanguageStore, file: string[], directory: string) {
        super(client, store, file, directory);

        this.language = {
            DEAR: 'Dear',
            COMMAND_BAN_DESCRIPTION: 'Bans the mentioned member',
            COMMAND_BAN_FAIL_BANNABLE: 'I am not able to ban this member',
            POSITION: 'You are unable to ban this member',
            COMMAND_BAN_SUCCESS: 'Successfully banned the member',
            REASON: 'With reason of'
        };
    }
}