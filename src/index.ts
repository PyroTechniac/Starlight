import { DashboardClient } from 'klasa-dashboard-hooks';
import { StarlightClient } from './client/StarlightClient';


StarlightClient.use(DashboardClient)
    .defaultClientSchema
    .add('owners', 'User', { array: true });
StarlightClient
    .defaultGuildSchema
    .add('deleteCommand', 'boolean', { default: false })
    .add('antiinvite', 'boolean', { default: false });

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
    production,
    providers: {
        default: 'sqlite'
    },
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
}).login(process.env.TOKEN);