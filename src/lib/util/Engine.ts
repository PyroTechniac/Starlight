import { ClientEngine } from '../structures/ClientEngine';
import { Client } from 'discord.js';

export abstract class Engine {

	public constructor(public readonly manager: ClientEngine) {
	}

	public get client(): Client {
		return this.manager.client;
	}

}
