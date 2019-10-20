import { ServerOptions } from 'http';
import { StarlightClient } from './lib/StarlightClient';
import { ApiRequest } from './lib/structures/api/ApiRequest';
import { ApiResponse } from './lib/structures/api/ApiResponse';

const { PREFIX: prefix, TOKEN: token, CLIENT_SECRET: clientSecret, CLIENT_ID: clientID } = process.env;

const serverOptions: ServerOptions = {
	IncomingMessage: ApiRequest,
	ServerResponse: ApiResponse
};

StarlightClient;

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
	},
	dashboardHooks: {
		apiPrefix: '/',
		serverOptions
	},
	clientSecret,
	clientID
}).login(token);
