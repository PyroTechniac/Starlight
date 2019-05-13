import { config } from 'dotenv';
import { SchemaFolder } from 'klasa';
import { StarlightClient } from './client/Client';
import * as Raven from 'raven';

config();

Raven.config(process.env.SENTRY, { captureUnhandledRejections: true }).install();

StarlightClient.use(require('./plugins/functions'))
    .use(require('@kcp/channels-gateway'))
    .use(require('@kcp/tags'));

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
    gateways: {},
    providers: {
        default: 'rethinkdb'
    },
    fetchAllMembers: true // Just for now, as my bot isn't large
}).start();