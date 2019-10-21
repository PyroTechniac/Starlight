import { Provider, util } from 'klasa';
import { r, MasterPool, TableChangeResult, WriteResult } from 'rethinkdb-ts';

export default class extends Provider {

	public db = r;
	public pool: MasterPool | null = null;

	public async init(): Promise<void> {
		if (this.client.options.providers.default !== 'rethinkdb') return this.unload();
		const options = util.mergeDefault({
			db: 'starlight',
			silent: false
		}, this.client.options.providers.rethinkdb);

		this.pool = await r.connectPool(options);
		await this.db.branch(this.db.dbList().contains(options.db), null, this.db.dbCreate(options.db)).run();
	}

	public async ping(): Promise<number> {
		const now = Date.now();
		return (await this.db.now().run()).getTime() - now;
	}

	public async shutdown(): Promise<void> {
		if (!this.pool) return;
		return this.pool.drain();
	}

	public hasTable(table: string): Promise<boolean> {
		return this.db.tableList().contains(table).run();
	}

	public createTable(table: string): Promise<TableChangeResult> {
		return this.db.tableCreate(table).run();
	}

	public deleteTable(table: string): Promise<TableChangeResult> {
		return this.db.tableDrop(table).run();
	}

	public sync(table: string): Promise<{synced: number}> {
		return this.db.table(table).sync().run();
	}

	public async getAll(table: string, entries: any[] = []): Promise<any[]> {
		if (entries.length) {
			const chunks = util.chunk(entries, 50000);
			const output: any[] = [];
			for (const myChunk of chunks) output.push(...await this.db.table(table).getAll(...myChunk).run());
			return output;
		}
		return this.db.table(table).run();
	}

	public async getKeys(table: string, entries: any[] = []): Promise<string[]> {
		if (entries.length) {
			const chunks = util.chunk(entries, 50000);
			const output: string[] = [];
			for (const myChunk of chunks) output.push(...await this.db.table(table).getAll(...myChunk)('id').run());
			return output;
		}

		return this.db.table(table)('id').run();
	}

	public get(table: string, id: string): Promise<any> {
		return this.db.table(table).get(id).run();
	}

	public has(table: string, id: string): Promise<boolean> {
		return this.db.table(table).get(id).ne(null)
			.run();
	}

	public getRandom(table: string): Promise<any> {
		return this.db.table(table).sample(1).run();
	}

	public create(table: string, id: string, value = {}): Promise<WriteResult> {
		return this.db.table(table).insert({ ...this.parseUpdateInput(value), id }).run();
	}

	public update(table: string, id: string, value: any): Promise<WriteResult> {
		return this.db.table(table).get(id).update(this.parseUpdateInput(value))
			.run();
	}

	public replace(table: string, id: string, value: any): Promise<WriteResult> {
		return this.db.table(table).get(id).replace({ ...this.parseUpdateInput(value), id })
			.run();
	}

	public delete(table: string, id: string): Promise<WriteResult> {
		return this.db.table(table).get(id).delete()
			.run();
	}

}
