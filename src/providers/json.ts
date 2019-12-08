import { FileSystemProvider } from '../lib/util/BaseProvider';
import { readJSON, outputJSONAtomic } from 'fs-nextra';
import { mergeObjects } from '@klasa/utils';

export default class extends FileSystemProvider {

	public async get(table: string, id: string): Promise<unknown> {
		try {
			return await readJSON(this.resolve(table, id));
		} catch {
			return null;
		}
	}

	public create(table: string, id: string, data: object = {}): Promise<void> {
		return outputJSONAtomic(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

	public async update(table: string, id: string, data: object): Promise<void> {
		const existent = await this.get(table, id) as Record<PropertyKey, unknown>;
		const parsedData = this.parseUpdateInput(data) as Record<PropertyKey, unknown>;
		return outputJSONAtomic(this.resolve(table, id), mergeObjects(existent || { id }, parsedData));
	}

	public replace(table: string, id: string, data: object): Promise<void> {
		return outputJSONAtomic(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

}
