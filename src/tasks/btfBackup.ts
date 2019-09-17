import { Task, Provider, Timestamp } from 'klasa';
import { ensureDir, targz } from 'fs-nextra';
import { dirname, resolve } from 'path';

export default class extends Task {

	private timestamp: Timestamp = new Timestamp('YYYY-MM-DD[T]HHmmss');

	private get provider(): Provider & { baseDirectory: string } {
		return this.client.providers.get('btf')! as Provider & { baseDirectory: string };
	}

	public async run(data = { folder: './' }): Promise<void> {
		if (this.client.options.providers.default !== 'btf') return;
		if (!('folder' in data)) data = { folder: './' };

		const file = resolve(data.folder, `btf-backup-${this.timestamp}.tar.gz`);

		await ensureDir(dirname(file)).then((): Promise<void> => targz(file, this.provider.baseDirectory));
	}

}
