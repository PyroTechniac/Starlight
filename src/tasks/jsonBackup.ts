import { ensureDir, targz } from 'fs-nextra';
import { Task, Timestamp } from 'klasa';
import { dirname, resolve } from 'path';
import JsonProvider from '../providers/json';

export default class extends Task {

	private timestamp: Timestamp = new Timestamp('YYYY-MM-DD[T]HHmmss');

	private get provider(): JsonProvider {
		return this.client.providers.get('json')! as JsonProvider;
	}

	public init(): Promise<void> {
		if (this.client.options.providers.default !== 'json') this.disable();
		return Promise.resolve();
	}

	public async run(data = { folder: './' }): Promise<void> {
		if (this.client.options.providers.default !== 'json') return;
		if (!('folder' in data)) data = { folder: './' };

		const file = resolve(data.folder, `json-backup-${this.timestamp}.tar.gz`);

		await ensureDir(dirname(file)).then((): Promise<void> => targz(file, this.provider.baseDirectory));
	}

}
