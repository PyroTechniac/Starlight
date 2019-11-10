import { chunk, mergeDefault, mergeObjects } from '@klasa/utils';
import * as fs from 'fs-nextra';
import { ProviderStore } from 'klasa';
import { resolve } from 'path';
import { Events } from '../lib/types/Enums';
import { FSProvider } from '../lib/types/Interfaces';
import { Provider } from '../lib/util/BaseProvider';
import { noop } from '../lib/util/Utils';

export default class extends Provider implements FSProvider {

	public baseDirectory: string;
	public resolve: (...args: string[]) => string;

	public constructor(store: ProviderStore, file: string[], directory: string) {
		super(store, file, directory);

		const baseDirectory = resolve(this.client.userBaseDirectory, 'bwd', 'provider', 'json');
		const defaults = mergeDefault<{ baseDirectory: string }, { baseDirectory: string }>({ baseDirectory }, this.client.options.providers.json);

		this.baseDirectory = defaults.baseDirectory;
		this.resolve = resolve.bind(null, this.baseDirectory);
	}

	public async init(): Promise<void> {
		if (this.shouldUnload) return this.unload();
		await fs.ensureDir(this.baseDirectory).catch((err): boolean => this.client.emit(Events.Error, err));
	}

	public hasTable(table: string): Promise<boolean> {
		return fs.pathExists(this.resolve(table));
	}

	public createTable(table: string): Promise<void> {
		return fs.mkdir(this.resolve(table));
	}

	public async deleteTable(table: string): Promise<void> {
		if (!await this.hasTable(table)) return;
		const resolved = this.resolve(table);
		await fs.emptyDir(resolved);
		await fs.remove(resolved);
	}

	public async getAll(table: string, entries: string[] = []): Promise<any[]> {
		if (!Array.isArray(entries) || !entries.length) entries = await this.getKeys(table);
		if (entries.length < 5000) {
			return Promise.all(entries.map(this.get.bind(this, table)));
		}

		const chunks = chunk(entries, 5000);
		const output: any[] = [];
		for (const chunk of chunks) output.push(...await Promise.all(chunk.map(this.get.bind(this, table))));
		return output;
	}

	public async getKeys(table: string): Promise<string[]> {
		const dir = this.resolve(table);
		return (await fs.readdir(dir))
			.filter((filename): boolean => filename.endsWith('.json'))
			.map((file): string => file.slice(0, file.length - 5));
	}

	public get(table: string, id: string): Promise<any> {
		return fs.readJSON(this.resolve(table, `${id}.json`)).catch(noop);
	}

	public has(table: string, id: string): Promise<boolean> {
		return fs.pathExists(this.resolve(table, `${id}.json`));
	}

	public getRandom(table: string): Promise<any> {
		return this.getKeys(table).then((data): Promise<any> => this.get(table, data[Math.floor(Math.random() * data.length)]));
	}

	public create(table: string, id: string, data: object = {}): Promise<void> {
		return fs.outputJSONAtomic(this.resolve(table, `${id}.json`), { id, ...this.parseUpdateInput(data) });
	}

	public async update(table: string, id: string, data: Record<string | number | symbol, unknown>): Promise<void> {
		const existent = await this.get(table, id);
		return fs.outputJSONAtomic(this.resolve(table, `${id}.json`), mergeObjects(existent || { id }, this.parseUpdateInput(data)));
	}

	public replace(table: string, id: string, data: object): Promise<void> {
		return fs.outputJSONAtomic(this.resolve(table, `${id}.json`), { id, ...this.parseUpdateInput(data) });
	}

	public delete(table: string, id: string): Promise<void> {
		return fs.unlink(this.resolve(table, `${id}.json`));
	}

}
