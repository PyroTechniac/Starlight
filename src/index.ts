import { StarlightClient } from './client/StarlightClient';
import { ShardingManager } from 'kurasuta';
import { join } from 'path';
import { KlasaClientOptions } from 'klasa';

const production = process.env.NODE_ENV === 'production';

new ShardingManager(join(__dirname, 'main'), {
    clientOptions: { // eslint-disable-line
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
    } as KlasaClientOptions,
    client: StarlightClient,
    token: process.env.TOKEN,
    ipcSocket: 1234
}).spawn();