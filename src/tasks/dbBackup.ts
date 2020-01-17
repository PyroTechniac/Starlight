import { Task, Timestamp } from 'klasa';
import RethinkProvider from '../providers/rethinkdb';
import { resolve } from 'path';
import { CronTimes, Events } from '../lib/types/Enums';
import { SetupTask } from '../lib/util/Decorators';
import { FileSystemProvider } from '../lib/util/FileSystemProvider';
import { cast } from '../lib/util/Utils';

@SetupTask(CronTimes.Daily, { catchUp: true })
export default class extends Task {

	private timestamp: Timestamp = new Timestamp('YYYY-MM-DD[T]HHmmss');

	private get provider(): RethinkProvider | FileSystemProvider {
		return cast<FileSystemProvider | RethinkProvider>(this.client.providers.default);
	}

	public async run(): Promise<void> {
		// Backup the default provider first
		await this.backup();
		for (const provider of this.client.providers.keys()) {
			if (provider === this.provider.name) continue;
			try {
				this.client.emit(Events.Log, `[PROVIDER] Starting backup for provider ${provider}`);
				await this.backup(provider);
				this.client.emit(Events.Log, `[PROVIDER] Finished backup for provider ${provider}`);
			} catch (err) {
				this.client.emit(Events.Error, `[PROVIDER] Backup failed for provider ${provider}`);
			}
		}
	}

	private backup(provider: string = this.provider.name): Promise<void> {
		switch (provider) {
			case 'toml':
			case 'json':
			case 'btf':
			case 'yaml':
				return this.backupFSProvider();
			case 'rethinkdb':
				return this.backupRethinkProvider();
			case 'cache':
				return Promise.resolve();
			default:
				this.client.emit(Events.Warn, `Backup not setup for provider ${provider}`);
				return Promise.resolve();
		}
	}

	private async backupFSProvider(): Promise<void> {
		const provider = cast<FileSystemProvider>(this.provider);

		const file = resolve('./', 'backup', `${provider.name}-backup-${this.timestamp}.tar.gz`);
		await provider.backup(file);
	}

	private async backupRethinkProvider(): Promise<void> {
		const provider = cast<RethinkProvider>(this.provider);

		const baseDBName = (provider.pool! as unknown as { connParam: { db: string } }).connParam.db;
		const { db: r } = provider;

		await r.branch(r.dbList().contains('backup'), null, r.dbCreate('backup')).run();
		for (const table of this.client.gateways.keys()) {
			if (!await r.db('backup').tableList().contains(table)
				.run()) {
				await r.db('backup').tableCreate(table).run();
			}
			await r.db('backup').table(table).insert(r.db(baseDBName).table(table))
				.run();
		}
	}

}
