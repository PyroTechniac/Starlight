import {
	KeyedObject,
	Provider as BaseProvider,
	ProviderStore,
	SchemaEntry,
	SQLProvider as BaseSQLProvider,
	Type
} from 'klasa';
import { FSProvider } from '../types/Interfaces';
import { resolve } from 'path';
import * as fs from 'fs-nextra';
import { chunk, isNumber, makeObject, mergeDefault, mergeObjects } from '@klasa/utils';
import { Events } from '../types/Enums';
import { AnyObject } from '../types/Types';
import { isSchemaFolder } from './Utils';


export abstract class Provider extends BaseProvider {

	protected get shouldUnload(): boolean {
		return this.client.options.providers.default !== this.name;
	}

}

export abstract class SQLProvider extends BaseSQLProvider {

	protected get shouldUnload(): boolean {
		return this.client.options.providers.default !== this.name;
	}

	protected cValue(table: string, key: string, value: unknown): string {
		const gateway = this.client.gateways.get(table);
		if (typeof gateway === 'undefined') return this.cUnknown(value);

		const entry = gateway.schema.get(key);
		if (!entry || isSchemaFolder(entry)) return this.cUnknown(value);

		const qbEntry = this.qb.get(entry.type);
		return qbEntry
			? entry.array
				? qbEntry.arraySerializer(value as unknown[], entry, qbEntry.serializer)
				: qbEntry.serializer(value, entry)
			: this.cUnknown(value);
	}

	protected cValues(table: string, keys: readonly string[], values: readonly unknown[]): string[] {
		const gateway = this.client.gateways.get(table);
		if (typeof gateway === 'undefined') return values.map(this.cUnknown.bind(this));

		const { schema } = gateway;
		const parsedValues: string[] = [];
		for (let i = 0; i < keys.length; ++i) {
			const key = keys[i];
			const value = values[i];
			const entry = schema.get(key);
			if (!entry || isSchemaFolder(entry)) {
				parsedValues.push(this.cUnknown(value));
				continue;
			}

			const qbEntry = this.qb.get(entry.type);
			parsedValues.push(qbEntry
				? entry.array
					? qbEntry.arraySerializer(value as unknown[], entry, qbEntry.serializer)
					: value === null
						? 'NULL'
						: qbEntry.serializer(value, entry)
				: this.cUnknown(value));
		}
		return parsedValues;
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

	protected cIdentifier(input: string): string {
		return `"${input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
	}

	protected cString(value: string): string {
		return `'${value.replace(/'/g, '\'\'')}'`;
	}

	protected cNumber(value: number | bigint): string {
		return value.toString();
	}

	protected cBoolean(value: boolean): string {
		return value ? 'TRUE' : 'FALSE';
	}

	protected cDate(value: Date): string {
		return this.cNumber(value.getTime());
	}

	protected cJson(value: AnyObject): string {
		return this.cString(JSON.stringify(value));
	}

	protected cArray(value: readonly unknown[]): string {
		return `${value.map(this.cUnknown.bind(this)).join(', ')}`;
	}

	protected cUnknown(value: unknown): string {
		switch (typeof value) {
			case 'string':
				return this.cString(value);
			case 'bigint':
			case 'number':
				return this.cNumber(value);
			case 'boolean':
				return this.cBoolean(value);
			case 'object':
				if (value === null) return 'NULL';
				if (Array.isArray(value)) return this.cArray(value);
				if (value instanceof Date) return this.cDate(value);
				return this.cJson(value);
			case 'undefined':
				return 'NULL';
			default:
				throw new TypeError(`Cannot serialize a ${new Type(value)}`);
		}
	}

}

export abstract class FileSystemProvider extends Provider implements FSProvider {

	public baseDirectory: string;

	public constructor(store: ProviderStore, file: string[], directory: string) {
		super(store, file, directory);

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
			return Promise.all(entries.map(this.get.bind(this, table))) as Promise<KeyedObject[]>;
		}

		const chunks = chunk(entries, 5000);
		const output: KeyedObject[] = [];
		for (const chunk of chunks) output.push(...await Promise.all(chunk.map(this.get.bind(this, table))) as KeyedObject[]);
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
