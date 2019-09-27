import { StarlightClient, ClientSettings } from './lib';
import { SchemaFolder, KlasaClientOptions } from 'klasa';
import { ShardingManager } from 'kurasuta';
import { join } from 'path';

const { PREFIX: prefix, TOKEN: token } = process.env;

StarlightClient
	.use(require('klasa-dashboard-hooks'))
	.defaultClientSchema
	.add('owners', 'User', { array: true });

StarlightClient
	.defaultGuildSchema
	.add('channels', (folder: SchemaFolder): SchemaFolder => folder
		.add('modlogs', 'TextChannel'));

StarlightClient
	.defaultPermissionLevels
	.add(10, ({ client, author }): boolean => client.owners.has(author!) || (client.settings!.get(ClientSettings.Owners) as ClientSettings.Owners).includes(author!.id));

new ShardingManager(join(__dirname, 'main'), {
	token,
	client: StarlightClient,
	clientOptions: { // eslint-disable-line @typescript-eslint/no-object-literal-type-assertion
		prefix,
		consoleEvents: {
			debug: true,
			log: true,
			error: true,
			verbose: true,
			warn: true
		},
		commandEditing: true,
		commandLogging: true,
		fetchAllMembers: true,
		schedule: {
			interval: 'INTERVAL' in process.env ? Number(process.env.INTERVAL) || 5000 : 5000
		},
		readyMessage: (client: StarlightClient): string => `[INTERNAL] Successfully initialized. Ready to serve ${client.guilds.size} guild${client.guilds.size === 1 ? '' : 's'}.`,
        restRequestTimeout: 60000,
        disabledEvents: [
            'TYPING_START',
            'PRESENCE_UPDATE'
        ]
	} as KlasaClientOptions
}).spawn().catch(console.error);
