import {
	KeyedObject,
	Provider as BaseProvider,
	ProviderStore,
	SchemaEntry,
	SQLProvider as BaseSQLProvider
} from 'klasa';
import { FSProvider } from '../types/Interfaces';
import { resolve } from 'path';
import * as fs from 'fs-nextra';
import { chunk, isNumber, makeObject, mergeDefault } from '@klasa/utils';
import { Events } from '../types/Enums';


export abstract class Provider extends BaseProvider {

	protected get shouldUnload(): boolean {
		return this.client.options.providers.default !== this.name;
	}

}

export abstract class SQLProvider extends BaseSQLProvider {

	protected get shouldUnload(): boolean {
		return this.client.options.providers.default !== this.name;
	}

	protected parseSQLEntry(table: string, raw: Record<string, unknown> | null): Record<string, unknown> | null {
		if (!raw) return null;

		const gateway = this.client.gateways.get(table);
		if (typeof gateway === 'undefined') return raw;

		const obj: Record<string, unknown> = { id: raw.id };
		for (const entry of gateway.schema.values(true)) {
			makeObject(entry.path, this.parseValue(raw[entry.path], entry), obj);
		}

		return obj;
	}

	protected parseValue(value: unknown, schemaEntry: SchemaEntry): unknown {
		if (value === null || typeof value === 'undefined') return schemaEntry.default;
		return Array.isArray(value)
			? value.map((element): unknown => this.parsePrimitiveValue(element, schemaEntry.type))
			: this.parsePrimitiveValue(value, schemaEntry.type);
	}

	protected parsePrimitiveValue(value: unknown, type: string): unknown {
		switch (type) {
			case 'number':
			case 'float': {
				const float = typeof value === 'string' ? Number.parseFloat(value) : value;
				return isNumber(float) ? float : null;
			}
			case 'integer': {
				const int = typeof value === 'string' ? Number.parseInt(value, 10) : value;
				return isNumber(int) ? int : null;
			}
			case 'string':
				return typeof value === 'string' ? value.trim() : null;
			default:
				return value;
		}
	}

}

export abstract class FileSystemProvider extends Provider implements FSProvider {

	public baseDirectory: string;

	public constructor(store: ProviderStore, file: string[], directory: string) {
		super(store, file, directory);

		const baseDirectory = resolve(this.client.userBaseDirectory, 'bwd', 'provider', this.extension);
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
			return Promise.all(entries.map(this.get.bind(this, table))) as Promise<KeyedObject[]>;
		}

		const chunks = chunk(entries, 5000);
		const output: KeyedObject[] = [];
		for (const chunk of chunks) output.push(...await Promise.all(chunk.map(this.get.bind(this, table))) as KeyedObject[]);
		return output;
	}

	public async getKeys(table: string): Promise<string[]> {
		const extension = `.${this.extension}`;
		return (await fs.readdir(this.resolve(table)))
			.filter((filename): boolean => filename.endsWith(extension))
			.map((file): string => file.slice(0, file.length - extension.length));
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

	protected resolve(table: string, id?: string): string {
		return id ? resolve(this.baseDirectory, table, `${id}.${this.extension}`) : resolve(this.baseDirectory, table);
	}

}
