import { APIWebhookData } from '../types/Interfaces';
// This is just in case the process.env isn't filled yet.
import { config } from 'dotenv';
import { KlasaClientOptions, KlasaClient } from 'klasa';
import { ServerOptions } from 'https';
import { ApiRequest } from '../structures/api/ApiRequest';
import { ApiResponse } from '../structures/api/ApiResponse';
config();

export const ERROR_WEBHOOK_DATA: APIWebhookData = {
	id: '625154971918139412',
	guild_id: '449679505519411215',
	channel_id: '625154324992884737',
	avatar: '394c0e13926fe83edd2bb79b41c6b627',
	token: process.env.ERROR_WEBHOOK_TOKEN || '',
	name: 'Starlight Error'
};

export const STATS_WEBHOOK_DATA: APIWebhookData = {
	id: '625451204255678464',
	guild_id: '449679505519411215',
	channel_id: '625154324992884737',
	avatar: '394c0e13926fe83edd2bb79b41c6b627',
	token: process.env.STATS_WEBHOOK_TOKEN || '',
	name: 'Starlight Stats'
};

export const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

const { PREFIX: prefix, CLIENT_SECRET: clientSecret, CLIENT_ID: clientID, DEFAULT_PROVIDER: defaultProvider } = process.env;

const serverOptions: ServerOptions = {
	IncomingMessage: ApiRequest,
	ServerResponse: ApiResponse
};

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
	regexPrefix: /^((Hey |Ok )?Star(light)?(?:,|!| ))/i
};
