import * as fs from 'fs-nextra';
import { ProviderStore, util } from 'klasa';
import { resolve } from 'path';
import { Events } from '../lib/types/Enums';
import { Provider } from '../lib/util/BaseProvider';
import { noop } from '../lib/util/Utils';

export default class extends Provider {

	public baseDirectory: string;
	public constructor(store: ProviderStore, file: string[], directory: string) {
		super(store, file, directory);

		const baseDirectory = resolve(this.client.userBaseDirectory, 'bwd', 'provider', 'json');
		const defaults = util.mergeDefault<{ baseDirectory: string }>({ baseDirectory }, this.client.options.providers.json);

		this.baseDirectory = defaults.baseDirectory;
	}

	public async init(): Promise<void> {
		if (this.shouldUnload) return this.unload();
		await fs.ensureDir(this.baseDirectory).catch((err): boolean => this.client.emit(Events.Error, err));
	}

	public hasTable(table: string): Promise<boolean> {
		return fs.pathExists(resolve(this.baseDirectory, table));
	}

	public createTable(table: string): Promise<void> {
		return fs.mkdir(resolve(this.baseDirectory, table));
	}

	public deleteTable(table: string): Promise<void> {
		return this.hasTable(table)
			.then((exists): Promise<void> => exists ? fs.emptyDir(resolve(this.baseDirectory, table)).then((): Promise<void> => fs.remove(resolve(this.baseDirectory, table))) : Promise.resolve());
	}

	public async getAll(table: string, entries: string[] = []): Promise<any[]> {
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
		return (await fs.readdir(dir))
			.filter((filename): boolean => filename.endsWith('.json'))
			.map((file): string => file.slice(0, file.length - 5));
	}

	public get(table: string, id: string): Promise<any> {
		return fs.readJSON(resolve(this.baseDirectory, table, `${id}.json`)).catch(noop);
	}

	public has(table: string, id: string): Promise<boolean> {
		return fs.pathExists(resolve(this.baseDirectory, table, `${id}.json`));
	}

	public getRandom(table: string): Promise<any> {
		return this.getKeys(table).then((data): Promise<any> => this.get(table, data[Math.floor(Math.random() * data.length)]));
	}

	public create(table: string, id: string, data: object = {}): Promise<void> {
		return fs.outputJSONAtomic(resolve(this.baseDirectory, table, `${id}.json`), { id, ...this.parseUpdateInput(data) });
	}

	public async update(table: string, id: string, data: object): Promise<void> {
		const existent = await this.get(table, id);
		return fs.outputJSONAtomic(resolve(this.baseDirectory, table, `${id}.json`), util.mergeObjects(existent || { id }, this.parseUpdateInput(data)));
	}

	public replace(table: string, id: string, data: object): Promise<void> {
		return fs.outputJSONAtomic(resolve(this.baseDirectory, table, `${id}.json`), { id, ...this.parseUpdateInput(data) });
	}

	public delete(table: string, id: string): Promise<void> {
		return fs.unlink(resolve(this.baseDirectory, table, `${id}.json`));
	}

}
