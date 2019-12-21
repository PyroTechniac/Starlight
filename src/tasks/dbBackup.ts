import { Task, Timestamp } from 'klasa';
import JsonProvider from '../providers/json';
import TomlProvider from '../providers/toml';
import RethinkProvider from '../providers/rethinkdb';
import BtfProvider from '../providers/btf';
import { dirname, resolve } from 'path';
import { ensureDir, targz } from 'fs-nextra';
import { CronTimes, Events } from '../lib/types/Enums';
import { SetupTask } from '../lib/util/Decorators';

@SetupTask(CronTimes.Daily, { catchUp: true })
export default class extends Task {

	private timestamp: Timestamp = new Timestamp('YYYY-MM-DD[T]HHmmss');

	private get provider(): JsonProvider | RethinkProvider | TomlProvider {
		return this.client.providers.default as JsonProvider | RethinkProvider | TomlProvider | BtfProvider;
	}

	public async run(): Promise<void> {
		// Backup the default provider first
		await this.backup(this.provider.name);
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

	private async backup(provider: string): Promise<void> {
		switch (provider) {
			case 'toml':
			case 'json':
			case 'btf':
				return this.backupFSProvider();
			case 'rethinkdb':
				return this.backupRethinkProvider();
			default:
				this.client.emit(Events.Warn, `Backup not setup for provider ${provider}`);
		}
	}

	private async backupFSProvider(): Promise<void> {
		const provider = this.provider as JsonProvider | TomlProvider | BtfProvider;

		const file = resolve('./', 'backup', `${provider.name}-backup-${this.timestamp}.tar.gz`);
		await ensureDir(dirname(file)).then((): Promise<void> => targz(file, provider.baseDirectory));
	}

	private async backupRethinkProvider(): Promise<void> {
		const provider = this.provider as RethinkProvider;

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
