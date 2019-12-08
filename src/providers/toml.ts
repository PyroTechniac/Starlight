import { FileSystemProvider } from '../lib/util/BaseProvider';
import { readTOML, outputTOMLAtomic } from '../lib/util/FS';
import { mergeObjects } from '@klasa/utils';

export default class extends FileSystemProvider {

	public async get(table: string, id: string): Promise<unknown> {
		try {
			return await readTOML(this.resolve(table, id));
		} catch {
			return null;
		}
	}

	public create(table: string, id: string, data: object = {}): Promise<void> {
		return outputTOMLAtomic(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

	public async update(table: string, id: string, data: object = {}): Promise<void> {
		const existent = await this.get(table, id) as Record<PropertyKey, unknown>;
		const parsed = this.parseUpdateInput(data) as Record<PropertyKey, unknown>;
		return outputTOMLAtomic(this.resolve(table, id), mergeObjects(existent || { id }, parsed));
	}

	public replace(table: string, id: string, data: object): Promise<void> {
		return outputTOMLAtomic(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

}
