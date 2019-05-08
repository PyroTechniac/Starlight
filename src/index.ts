import { StarlightClient } from './client/Client';
import { config } from 'dotenv';
config();
StarlightClient.use(require('./plugins/functions'))
    .use(require('./plugins/points'));

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
    prefix: process.env.PREFIX
}).start();