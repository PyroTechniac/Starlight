import { FileSystemProvider } from '../lib/util/BaseProvider';
import { outputYAMLAtomic, readYAML } from '../lib/util/FS';
import { mergeObjects } from '@klasa/utils';
import { KeyedObject } from 'klasa';

export default class extends FileSystemProvider {

	public get extension(): string {
		return 'yml';
	}

	public async get(table: string, id: string): Promise<KeyedObject | null> {
		try {
			return await readYAML(this.resolve(table, id));
		} catch {
			return null;
		}
	}

	public create(table: string, id: string, data: object = {}): Promise<void> {
		return outputYAMLAtomic(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

	public async update(table: string, id: string, data: object): Promise<void> {
		const existent = await this.get(table, id) as Record<PropertyKey, unknown>;
		const parsed = this.parseUpdateInput(data);
		return outputYAMLAtomic(this.resolve(table, id), mergeObjects(existent || { id }, parsed));
	}

	public replace(table: string, id: string, data: object): Promise<void> {
		return outputYAMLAtomic(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

}
