import { config } from 'dotenv';
import { SchemaFolder } from 'klasa';
import { StarlightClient } from './client/Client';
import * as Raven from 'raven';

import './lib/extensions/MusicGuild';

config();

Raven.config(process.env.SENTRY, { captureUnhandledRejections: true }).install();

StarlightClient.use(require('./plugins/functions'))
    .use(require('@kcp/channels-gateway'))
    .use(require('@kcp/tags'));

StarlightClient.defaultPermissionLevels
    .add(4, ({ guild, member }): boolean => guild! && member!.permissions.has('KICK_MEMBERS'), { fetch: true })
    .add(5, ({ guild, member }): boolean => guild! && member!.permissions.has('BAN_MEMBERS'), { fetch: true });

StarlightClient.defaultGuildSchema
    .add('antiinvite', 'boolean', { default: false })
    .add('channels', (folder): SchemaFolder => folder
        .add('modlog', 'TextChannel'))
    .add('modlogs', 'any', { array: true });

const production = process.env.NODE_ENV === 'production';

new StarlightClient({
    token: process.env.TOKEN,
    disabledEvents: ['TYPING_START'],
    consoleEvents: {
        wtf: true,
        debug: !production,
        warn: true,
        error: true,
        log: true,
        verbose: !production
    },
    prefix: process.env.PREFIX,
    production,
    regexPrefix: /^(hey |OK )?star(s|light)?(,|!| )/i,
    commandEditing: true,
    commandLogging: true,
    commandMessageLifetime: 1800,
    providers: {}
}).start();