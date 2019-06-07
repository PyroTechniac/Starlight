import { ShardingManager, ShardClientUtil } from 'kurasuta';
import { join } from 'path';
import { config } from 'dotenv';
import { StarlightClient } from './client/StarlightClient';
import { KlasaClientOptions } from 'klasa';

config();

/* eslint-disable @typescript-eslint/no-object-literal-type-assertion */

const production = process.env.NODE_ENV === 'production';

const sharder = new ShardingManager(join(__dirname, 'main'), {
    token: process.env.TOKEN,
    client: StarlightClient,
    clientOptions: {
        prefix: process.env.PREFIX,
        commandEditing: true,
        disableEveryone: true,
        disabledEvents: [
            'TYPING_START'
        ],
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
        production,
        fetchAllMembers: !production,
        providers: {
            default: 'postgresql',
            postgresql: {
                options: {
                    ssl: true,
                    connectionTimeoutMillis: 10000,
                    connectionString: process.env.PGSTRING
                }
            }
        },
        readyMessage: (client: StarlightClient): string => `Successfully initialized. Shard ${(client.shard as unknown as ShardClientUtil).id} is ready to serve ${client.guilds.size} guilds.`
    } as KlasaClientOptions,
    timeout: 60000,
    shardCount: 'auto'
});

sharder.spawn().catch(console.error); // eslint-disable-line no-console