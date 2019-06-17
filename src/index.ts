import { StarlightClient } from './client/StarlightClient';
import { SchemaFolder } from 'klasa';

StarlightClient.defaultGuildSchema
    .add('created', 'boolean', { default: false, configurable: false })
    .add('updateOnSave', 'boolean', { default: false })
    .add('general', (folder): SchemaFolder => folder
        .add('name', 'string', { configurable: false })
        .add('verificationLevel', 'integer', { configurable: false })
        .add('region', 'string', { configurable: false })
        .add('iconURL', 'string', { configurable: false }))
    .add('afk', (folder): SchemaFolder => folder
        .add('channel', 'VoiceChannel', { configurable: false })
        .add('timeout', 'integer', { configurable: false }));

const production = process.env.NODE_ENV === 'production';

new StarlightClient({
    prefix: process.env.PREFIX,
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
}).login(process.env.TOKEN);