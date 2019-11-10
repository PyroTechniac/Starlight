import { Provider } from '../lib/util/BaseProvider';
import { FSProvider } from '../lib/types/Interfaces';
import { ProviderStore } from 'klasa';
import { mergeDefault, chunk, mergeObjects } from '@klasa/utils';
import { resolve } from 'path';
import * as fs from 'fs-nextra';
import { serialize, deserialize } from 'binarytf';
import { Events } from '../lib/types/Enums';
import { noop } from '../lib/util/Utils';

export default class extends Provider implements FSProvider {

	public baseDirectory: string;
	public resolve: (...args: string[]) => string;

	public constructor(store: ProviderStore, file: string[], directory: string) {
		super(store, file, directory);

		const baseDirectory = resolve(this.client.userBaseDirectory, 'bwd', 'provider', 'btf');
		const defaults = mergeDefault<{ baseDirectory: string }, { baseDirectory: string }>({ baseDirectory }, this.client.options.providers.btf);

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
			.filter((filename): boolean => filename.endsWith('.btf'))
			.map((file): string => file.slice(0, file.length - 4));
	}

	public get(table: string, id: string): Promise<any> {
		return fs.readFile(this.resolve(table, `${id}.btf`))
			.then(deserialize)
			.catch(noop);
	}

	public has(table: string, id: string): Promise<boolean> {
		return fs.pathExists(this.resolve(table, `${id}.btf`));
	}

	public getRandom(table: string): Promise<any> {
		return this.getKeys(table).then((data): Promise<any> => this.get(table, data[Math.floor(Math.random() * data.length)]));
	}

	public create(table: string, id: string, data = {}): Promise<void> {
		return fs.outputFileAtomic(this.resolve(table, `${id}.btf`), serialize({ id, ...this.parseUpdateInput(data) }));
	}

	public async update(table: string, id: string, data: Record<string | number | symbol, unknown>): Promise<void> {
		const existent = await this.get(table, id);
		return fs.outputFileAtomic(this.resolve(table, `${id}.btf`), serialize(mergeObjects(existent || { id }, this.parseUpdateInput(data))));
	}

	public replace(table: string, id: string, data: object): Promise<void> {
		return fs.outputFileAtomic(this.resolve(table, `${id}.btf`), serialize({ id, ...this.parseUpdateInput(data) }));
	}

	public delete(table: string, id: string): Promise<void> {
		return fs.unlink(this.resolve(table, `${id}.btf`));
	}

}
