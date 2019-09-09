import { Provider, util, ProviderStore } from 'klasa';
import { serialize, deserialize } from 'binarytf';
import { resolve } from 'path';
import * as fsn from 'fs-nextra';
import { Events, noop } from '../lib';

export default class extends Provider {

	private baseDirectory: string;
	public constructor(store: ProviderStore, file: string[], directory: string) {
		super(store, file, directory);

		const baseDirectory = resolve(this.client.userBaseDirectory, 'bwd', 'provider', 'etf');
		const defaults = util.mergeDefault({ baseDirectory }, this.client.options.providers.etf);

		this.baseDirectory = defaults.baseDirectory;
	}

	public async init(): Promise<void> {
		await fsn.ensureDir(this.baseDirectory).catch((err): boolean => this.client.emit(Events.Error, err));
	}

	public hasTable(table: string): Promise<boolean> {
		return fsn.pathExists(resolve(this.baseDirectory, table));
	}

	public createTable(table: string): Promise<void> {
		return fsn.mkdir(resolve(this.baseDirectory, table));
	}

	public deleteTable(table: string): Promise<void | null> {
		return this.hasTable(table)
			.then(exists => exists ? fsn.emptyDir(resolve(this.baseDirectory, table))
				.then(() => fsn.remove(resolve(this.baseDirectory, table))) : null);
	}

	public async getAll(table: string, entries?: any[]): Promise<any[]> {
		if (!Array.isArray(entries) || !entries.length) entries = await this.getKeys(table);
		if (entries.length < 5000) {
			return Promise.all(entries.map(this.get.bind(this, table)));
		}

		const chunks = util.chunk(entries, 5000);
		const output: any[] = [];
		for (const chunk of chunks) output.push(...await Promise.all(chunk.map(this.get.bind(this, table))));
		return output;
	}

	public async getKeys(table: string): Promise<string[]> {
		const dir = resolve(this.baseDirectory, table);
		const filenames = await fsn.readdir(dir);
		const files: string[] = [];
		for (const filename of filenames) {
			if (filename.endsWith('.etf')) files.push(filename.slice(0, filename.length - 4));
		}
		return files;
	}

	public get(table: string, id: string): Promise<unknown> {
		return fsn.readFile(resolve(this.baseDirectory, table, `${id}.etf`))
			.then(deserialize)
			.catch(noop);
	}

	public has(table: string, id: string): Promise<boolean> {
		return fsn.pathExists(resolve(this.baseDirectory, table, `${id}.etf`));
	}

	public getRandom(table: string): Promise<any> {
		return this.getKeys(table).then((data): Promise<any> | null => data.length ? this.get(table, data[Math.floor(Math.random() * data.length)]) : null);
	}

	public create(table: string, id: string, data: Record<string, any> = {}): Promise<void> {
		return fsn.outputFileAtomic(resolve(this.baseDirectory, table, `${id}.etf`), serialize({ id, ...this.parseUpdateInput(data) }));
	}

	public async update(table: string, id: string, data: Record<string, any>): Promise<void> {
		const existent = await this.get(table, id);
		return fsn.outputFileAtomic(resolve(this.baseDirectory, table, `${id}.etf`), serialize(util.mergeDefault(existent || { id }, this.parseUpdateInput(data))));
	}

	public replace(table: string, id: string, data: Record<string, any>): Promise<void> {
		return fsn.outputFileAtomic(resolve(this.baseDirectory, table, `${id}.etf`), serialize({ id, ...this.parseUpdateInput(data) }));
	}

	public delete(table: string, id: string): Promise<void> {
		return fsn.unlink(resolve(this.baseDirectory, table, `${id}.etf`));
	}

}
