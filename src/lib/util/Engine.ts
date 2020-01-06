import { ClientEngine } from '../structures/ClientEngine';
import { Client } from 'discord.js';

export abstract class Engine {

	public constructor(public readonly engine: ClientEngine) {
	}

	public get client(): Client {
		return this.engine.client;
	}

}
