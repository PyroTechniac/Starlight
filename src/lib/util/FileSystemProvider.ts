import { Provider } from './BaseProvider';
import { FSProvider } from '../types/Interfaces';
import { KeyedObject, ProviderOptions, ProviderStore, Timestamp } from 'klasa';
import { resolve } from 'path';
import { cast, mergeDefault } from './Utils';
import * as fs from 'fs-nextra';
import { Events } from '../types/Enums';
import { chunk, mergeObjects } from '@klasa/utils';

export abstract class FileSystemProvider extends Provider implements FSProvider {

	public baseDirectory: string;

	public constructor(store: ProviderStore, file: string[], directory: string, options: ProviderOptions = {}) {
		super(store, file, directory, options);

		const baseDirectory = resolve(this.client.userBaseDirectory, 'bwd', 'provider', this.name);
		const defaults = mergeDefault<{ baseDirectory: string }, { baseDirectory: string }>({ baseDirectory }, this.client.options.providers[this.name]);
		this.baseDirectory = defaults.baseDirectory;
	}

	public get extension(): string {
		return this.name;
	}

	public async init(): Promise<void> {
		if (this.shouldUnload) return this.unload();
		await fs.ensureDir(this.baseDirectory).catch((err): boolean => this.client.emit(Events.Wtf, err));
	}

	public hasTable(table: string): Promise<boolean> {
		return fs.pathExists(this.resolve(table));
	}

	public createTable(table: string): Promise<void> {
		return fs.mkdir(this.resolve(table));
	}

	public async deleteTable(table: string): Promise<void | null> {
		const exists = await this.hasTable(table);
		return exists ? fs.emptyDir(this.resolve(table)).then((): Promise<void> => fs.remove(this.resolve(table))) : null;
	}

	public async getAll(table: string, entries?: string[]): Promise<KeyedObject[]> {
		if (!Array.isArray(entries) || !entries.length) entries = await this.getKeys(table);
		if (entries.length < 5000) {
			return cast<Promise<KeyedObject[]>>(Promise.all(entries.map(this.get.bind(this, table))));
		}

		const chunks = chunk(entries, 5000);
		const output: KeyedObject[] = [];
		for (const chunk of chunks) output.push(...cast<KeyedObject[]>(await Promise.all(chunk.map(this.get.bind(this, table)))));
		return output;
	}

	public async get(table: string, id: string): Promise<KeyedObject | null> {
		try {
			return await this.read(this.resolve(table, id));
		} catch {
			return null;
		}
	}

	public create(table: string, id: string, data: object = {}): Promise<void> {
		return this.write(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

	public async update(table: string, id: string, data: object): Promise<void> {
		const existent = await this.get(table, id) as Record<PropertyKey, unknown>;
		const parsedData = this.parseUpdateInput(data);
		return this.write(this.resolve(table, id), mergeObjects(existent || { id }, parsedData));
	}

	public replace(table: string, id: string, data: object): Promise<void> {
		return this.write(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

	public async getKeys(table: string): Promise<string[]> {
		const extension = `.${this.extension}`;
		const raw = await fs.readdir(this.resolve(table));
		const files: string[] = [];
		for (const filename of raw) {
			if (!filename.endsWith(extension)) continue;
			files.push(filename.slice(0, filename.length - extension.length));
		}

		return files;
	}

	public has(table: string, id: string): Promise<boolean> {
		return fs.pathExists(this.resolve(table, id));
	}

	public getRandom(table: string): Promise<unknown> {
		return this.getKeys(table).then((data): Promise<unknown> => this.get(table, data[Math.floor(Math.random() * data.length)]));
	}

	public delete(table: string, id: string): Promise<void> {
		return fs.unlink(this.resolve(table, id));
	}

	public abstract write(file: string, data: object): Promise<void>;

	public abstract read(file: string): Promise<KeyedObject>;

	protected resolve(table: string, id?: string): string {
		return id ? resolve(this.baseDirectory, table, `${id}.${this.extension}`) : resolve(this.baseDirectory, table);
	}

}
