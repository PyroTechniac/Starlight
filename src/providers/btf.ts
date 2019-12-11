import { FileSystemProvider } from '../lib/util/BaseProvider';
import { serialize, deserialize } from 'binarytf';
import { outputFileAtomic, readFile } from 'fs-nextra';
import { mergeObjects } from '@klasa/utils';
import { KeyedObject } from 'klasa';

export default class extends FileSystemProvider {

	public async get(table: string, id: string): Promise<KeyedObject | null> {
		try {
			const raw = await readFile(this.resolve(table, id));
			return deserialize(raw);
		} catch {
			return null;
		}
	}

	public create(table: string, id: string, data: object = {}): Promise<void> {
		return outputFileAtomic(this.resolve(table, id), serialize({ id, ...this.parseUpdateInput(data) }));
	}

	public async update(table: string, id: string, data: object): Promise<void> {
		const existent = await this.get(table, id) as Record<PropertyKey, unknown>;
		const parsed = this.parseUpdateInput(data);
		return outputFileAtomic(this.resolve(table, id), serialize(mergeObjects(existent || { id }, parsed)));
	}

	public replace(table: string, id: string, data: object): Promise<void> {
		return outputFileAtomic(this.resolve(table, id), serialize({ id, ...this.parseUpdateInput(data) }));
	}

}
