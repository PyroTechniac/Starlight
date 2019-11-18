import { Task, Timestamp } from 'klasa';
import JsonProvider from '../providers/json';
import TomlProvider from '../providers/toml';
import RethinkProvider from '../providers/rethinkdb';
import { dirname, resolve } from 'path';
import { ensureDir, targz } from 'fs-nextra';
import { Events } from '../lib/types/Enums';

export default class extends Task {

	private timestamp: Timestamp = new Timestamp('YYYY-MM-DD[T]HHmmss');

	private get provider(): JsonProvider | RethinkProvider | TomlProvider {
		return this.client.providers.default as JsonProvider | RethinkProvider | TomlProvider;
	}

	public async run(): Promise<void> {
		// Backup the default provider first
		await this.backup(this.provider.name);
		for (const provider of this.client.providers.keys()) {
			if (provider === this.provider.name) continue;
			await this.backup(provider);
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
		const provider = this.provider as JsonProvider | TomlProvider;

		const file = resolve('./backup', `${provider.name}-backup-${this.timestamp}.tar.gz`);
		await ensureDir(dirname(file)).then((): Promise<void> => targz(file, provider.baseDirectory));
	}

	private async backupRethinkProvider(): Promise<void> {
		const provider = this.provider as RethinkProvider;

		const baseDBName = (provider.pool! as unknown as {connParam: {db: string}}).connParam.db;
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
