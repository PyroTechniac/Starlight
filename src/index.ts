import { StarlightClient } from './lib';

const { PREFIX: prefix, TOKEN: token } = process.env;

StarlightClient.defaultClientSchema
	.add('owners', 'User', { array: true });

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
	}
}).login(token);
