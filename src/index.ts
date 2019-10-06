import { SchemaFolder } from 'klasa';
import { Client } from 'klasa-dashboard-hooks';
import { StarlightClient } from './lib/StarlightClient';

const { PREFIX: prefix, TOKEN: token } = process.env;

StarlightClient
	.use(Client)
	.defaultClientSchema
	.add('owners', 'User', { array: true });

StarlightClient
	.defaultGuildSchema
	.add('channels', (folder: SchemaFolder): SchemaFolder => folder
		.add('modlogs', 'TextChannel'));

new StarlightClient({
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
	],
	providers: {
		'default': 'toml'
	},
	console: {
		colors: {
			verbose: {
				time: {
					background: 'green',
					text: 'white'
				}
			}
		}
	},
	pieceDefaults: {
		ipcMonitors: {
			enabled: true
		}
	}
}).login(token);
