// This is just in case the process.env isn't filled yet.
import { config } from 'dotenv';
import { ServerOptions } from 'https';
import { KlasaClient, KlasaClientOptions } from 'klasa';
import { ApiRequest, ApiResponse } from '../structures/ApiObjects';
import { join, resolve } from 'path';

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

export const PERMS = {
	ADMINISTRATOR: 'Administrator',
	VIEW_AUDIT_LOG: 'View Audit Log',
	MANAGE_GUILD: 'Manage Server',
	MANAGE_ROLES: 'Manage Roles',
	MANAGE_CHANNELS: 'Manage Channels',
	KICK_MEMBERS: 'Kick Members',
	BAN_MEMBERS: 'Ban Members',
	CREATE_INSTANT_INVITE: 'Create Instant Invite',
	CHANGE_NICKNAME: 'Change Nickname',
	MANAGE_NICKNAMES: 'Manage Nicknames',
	MANAGE_EMOJIS: 'Manage Emojis',
	MANAGE_WEBHOOKS: 'Manage Webhooks',
	VIEW_CHANNEL: 'Read Messages',
	SEND_MESSAGES: 'Send Messages',
	SEND_TTS_MESSAGES: 'Send TTS Messages',
	MANAGE_MESSAGES: 'Manage Messages',
	EMBED_LINKS: 'Embed Links',
	ATTACH_FILES: 'Attach Files',
	READ_MESSAGE_HISTORY: 'Read Message History',
	MENTION_EVERYONE: 'Mention Everyone',
	USE_EXTERNAL_EMOJIS: 'Use External Emojis',
	ADD_REACTIONS: 'Add Reactions',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	STREAM: 'Stream',
	MUTE_MEMBERS: 'Mute Members',
	DEAFEN_MEMBERS: 'Deafen Members',
	MOVE_MEMBERS: 'Move Members',
	USE_VAD: 'Use Voice Activity',
	PRIORITY_SPEAKER: 'Priority Speaker'
};

export const rootFolder = join(__dirname, '..', '..', '..');

const baseDirectory = (name: string): string => resolve(rootFolder, 'bwd', 'provider', name);

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
		'default': defaultProvider || 'cache',
		'json': { baseDirectory: baseDirectory('json') },
		'toml': { baseDirectory: baseDirectory('toml') },
		'btf': { baseDirectory: baseDirectory('btf') },
		'yaml': { baseDirectory: baseDirectory('yaml') }
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
	cdnRequestTimeout: 15000,
	watchFiles: true
};
