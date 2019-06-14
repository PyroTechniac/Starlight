import { MoonlightClient } from './client/MoonlightClient';
import { Constants } from './lib/util';

const production = process.env.NODE_ENV === 'production';

new MoonlightClient({
    prefix: process.env.MOONLIGHT_PREFIX,
    commandEditing: true,
    disableEveryone: true,
    disabledEvents: ['TYPING_START'],
    noPrefixDM: true,
    regexPrefix: /^(hey |OK )?moon(s|light)?(,|!| )/i,
    consoleEvents: {
        wtf: true,
        debug: !production,
        warn: true,
        error: true,
        log: true,
        verbose: !production
    },
    fetchAllMembers: !production,
    commandLogging: true,
    production,
    permissionLevels: Constants.permissionLevels
}).login(process.env.MOONLIGHT_TOKEN);