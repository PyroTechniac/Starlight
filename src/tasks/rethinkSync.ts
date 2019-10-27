import { Task } from 'klasa';
import RethinkDBProvider from '../providers/rethinkdb';

export default class extends Task {

	public init(): Promise<void> {
		if (this.client.options.providers.default !== 'rethinkdb') this.disable();
		return Promise.resolve();
	}

	public get provider(): RethinkDBProvider {
		return this.client.providers.get('rethinkdb') as RethinkDBProvider;
	}

	public async run(): Promise<void> {
		const { provider } = this;

		for (const table of this.client.gateways.keys()) {
			await provider.sync(table);
		}
	}

}
