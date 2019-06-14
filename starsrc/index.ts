import { StarlightClient } from './client/StarlightClient';

StarlightClient.defaultGuildSchema
    .add('tags', 'any', { array: true })
    .add('antiinvite', 'boolean', { default: false })
    .add('minAccAge', 'integer', { default: 1800000 });

const production = process.env.NODE_ENV === 'production';


new StarlightClient({
    prefix: process.env.STARLIGHT_PREFIX,
    commandEditing: true,
    disableEveryone: true,
    disabledEvents: ['TYPING_START'],
    noPrefixDM: true,
    regexPrefix: /^(hey |OK )?star(s|light)?(,|!| )/i,
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
    production
}).login(process.env.STARLIGHT_TOKEN);