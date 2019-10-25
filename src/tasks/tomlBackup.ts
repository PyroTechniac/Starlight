import { ensureDir, targz } from 'fs-nextra';
import { Provider, Task, Timestamp } from 'klasa';
import { dirname, resolve } from 'path';

export default class extends Task {

	private timestamp: Timestamp = new Timestamp('YYYY-MM-DD[T]HHmmss');

	private get provider(): Provider & { baseDirectory: string } {
		return this.client.providers.get('toml')! as Provider & { baseDirectory: string };
	}

	public init(): Promise<void> {
		if (this.client.options.providers.default !== 'toml') this.disable();
		return Promise.resolve();
	}

	public async run(data = { folder: './' }): Promise<void> {
		if (this.client.options.providers.default !== 'toml') return;
		if (!('folder' in data)) data = { folder: './' };

		const file = resolve(data.folder, `toml-backup-${this.timestamp}.tar.gz`);

		await ensureDir(dirname(file)).then((): Promise<void> => targz(file, this.provider.baseDirectory));
	}

}
