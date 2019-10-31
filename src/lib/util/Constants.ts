// This is just in case the process.env isn't filled yet.
import { config } from 'dotenv';
import { ServerOptions } from 'https';
import { KlasaClient, KlasaClientOptions } from 'klasa';
import { ApiRequest } from '../structures/api/ApiRequest';
import { ApiResponse } from '../structures/api/ApiResponse';
import { join } from 'path';
config();

export const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

const {
	PREFIX: prefix,
	CLIENT_SECRET: clientSecret,
	CLIENT_ID: clientID,
	PROVIDER: defaultProvider
} = process.env;

const serverOptions: ServerOptions = {
	IncomingMessage: ApiRequest,
	ServerResponse: ApiResponse
};

export const rootFolder = join(__dirname, '..', '..', '..');

export const STARLIGHT_OPTIONS: KlasaClientOptions = {
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
	readyMessage: (client: KlasaClient): string => `[INTERNAL] Successfully initialized. Ready to serve ${client.guilds.size} guild${client.guilds.size === 1 ? '' : 's'}.`,
	restRequestTimeout: 60000,
	disabledEvents: [
		'TYPING_START',
		'PRESENCE_UPDATE'
	],
	providers: {
		'default': defaultProvider || 'toml'
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
	dashboardHooks: {
		apiPrefix: '/',
		serverOptions
	},
	clientSecret,
	clientID,
	regexPrefix: /^((Hey |Ok )?Star(light)?(?:,|!| ))/i,
	cdnSweepInterval: 60
};
