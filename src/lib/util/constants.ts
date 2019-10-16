import { APIWebhookData } from '../types/Interfaces';
// This is just in case the process.env isn't filled yet.
import { config } from 'dotenv';
import { KlasaClientOptions } from 'klasa';
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

export const STARLIGHT_OPTIONS: KlasaClientOptions = {
	cdnSweepInterval: 60
};
