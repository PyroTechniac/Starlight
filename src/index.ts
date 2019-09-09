import { StarlightClient } from './lib';

const { PREFIX: prefix, TOKEN: token } = process.env;

StarlightClient
	.use(require('klasa-dashboard-hooks'))
	.defaultClientSchema
	.add('owners', 'User', { array: true })
	.add('syncCount', 'integer', { 'default': 0, 'max': 3 });

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
	readyMessage: (client: StarlightClient): string => `[INTERNAL] Successfully initialized. Ready to serve ${client.guilds.size} guild${client.guilds.size === 1 ? '' : 's'}.`
}).login(token);
