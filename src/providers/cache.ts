import { Provider } from '../lib/util/BaseProvider';
import { ReadonlyKeyedObject, SettingsUpdateResults } from 'klasa';
import { mergeObjects } from '@klasa/utils';
import { Events } from "../lib/types/Enums";

// This is a development provider for when file system access is not granted to NodeJS and rethink cannot be set up
// It is in NO WAY meant for production, as it increases cache tremendously.
// However, this provider is the fastest of all, as it is pure JS, and doesn't query any external database.

const enum ErrorMessages {
	TableExists = 'Table Exists',
	TableNotExists = 'Table Not Exists',
	EntryExists = 'Entry Exists',
	EntryNotExists = 'Entry Not Exists'
}

export default class extends Provider {

	private tables = new Map<string, Map<string, object>>();

	public init(): Promise<void> {
		if (this.shouldUnload) return Promise.resolve(this.unload());
		this.client.emit(Events.Warn, '[PROVIDER] The cache provider is not meant for a production environment.');
		return Promise.resolve();
	}

	public createTable(table: string): Promise<void> {
		if (this.tables.has(table)) return Promise.reject(new Error(ErrorMessages.TableExists));
		this.tables.set(table, new Map());
		return Promise.resolve();
	}

	public deleteTable(table: string): Promise<void> {
		if (!this.tables.has(table)) return Promise.reject(new Error(ErrorMessages.TableNotExists));
		this.tables.delete(table);
		return Promise.resolve();
	}

	public hasTable(table: string): Promise<boolean> {
		return Promise.resolve(this.tables.has(table));
	}

	public create(table: string, entry: string, data: ReadonlyKeyedObject): Promise<void> {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		if (resolvedTable.has(entry)) return Promise.reject(new Error(ErrorMessages.EntryExists));
		const resolved = this.parseUpdateInput(data);
		resolvedTable.set(entry, { ...resolved, id: entry });
		return Promise.resolve();
	}

	public delete(table: string, entry: string): Promise<void> {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		if (!resolvedTable.has(entry)) return Promise.reject(new Error(ErrorMessages.EntryNotExists));
		resolvedTable.delete(entry);
		return Promise.resolve();
	}

	public get(table: string, entry: string): Promise<object | null> {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		return Promise.resolve(resolvedTable.get(entry) ?? null);
	}

	public getAll(table: string, entries?: readonly string[]): Promise<object[]> {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		if (typeof entries === 'undefined') {
			return Promise.resolve([...resolvedTable.values()]);
		}

		const values: object[] = [];
		for (const [key, value] of resolvedTable.entries()) {
			if (entries.includes(key)) values.push(value);
		}

		return Promise.resolve(values);
	}

	public getKeys(table: string): Promise<string[]> {
		const resolvedTable = this.tables.get(table);
		return typeof resolvedTable === 'undefined'
			? Promise.reject(new Error(ErrorMessages.TableNotExists))
			: Promise.resolve([...resolvedTable.keys()]);
	}

	public has(table: string, entry: string): Promise<boolean> {
		const resolvedTable = this.tables.get(table);
		return typeof resolvedTable === 'undefined'
			? Promise.reject(new Error(ErrorMessages.TableNotExists))
			: Promise.resolve(resolvedTable.has(entry));
	}

	public update(table: string, entry: string, data: ReadonlyKeyedObject | SettingsUpdateResults): Promise<void> {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));

		const resolvedEntry = resolvedTable.get(entry);
		if (typeof resolvedEntry === 'undefined') return Promise.reject(new Error(ErrorMessages.EntryNotExists));

		const resolved = this.parseUpdateInput(data);
		const merged = mergeObjects({ ...resolvedEntry }, resolved);
		resolvedTable.set(entry, merged);

		return Promise.resolve();
	}

	public replace(table: string, entry: string, data: ReadonlyKeyedObject | SettingsUpdateResults): Promise<void> {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));

		const resolvedEntry = resolvedTable.get(entry);
		if (typeof resolvedEntry === 'undefined') return Promise.reject(new Error(ErrorMessages.EntryNotExists));

		const resolved = this.parseUpdateInput(data);
		resolvedTable.set(entry, { ...resolved, id: entry });
		return Promise.resolve();
	}

}
