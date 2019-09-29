import { APIWebhookData } from '../typings/Interfaces';
// This is just in case the process.env isn't filled yet.
import { config } from 'dotenv';
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
