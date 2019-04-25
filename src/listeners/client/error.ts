import {Listener} from 'discord-akairo';

export default class ErrorListener extends Listener {
	public constructor() {
		super('error', {
			emitter: 'client',
			event: 'error',
			category: 'client'
		})
	}

	public exec(e: string) {
		this.client.console.error(e);
	}
}