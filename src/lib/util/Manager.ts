import { ClientManager } from '../structures/ClientManager';
import { Client } from 'discord.js';

export abstract class Manager {

	public constructor(public readonly manager: ClientManager) {
	}

	public get client(): Client {
		return this.manager.client;
	}

}
