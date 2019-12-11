import { FileSystemProvider } from '../lib/util/BaseProvider';
import { serialize, deserialize } from 'binarytf';
import { outputFileAtomic, readFile } from 'fs-nextra';
import { mergeObjects } from '@klasa/utils';
import {IdKeyedObject} from "klasa";
import {SettingsObject} from "../lib/types/Types";

export default class extends FileSystemProvider {

	public async get(table: string, id: string): Promise<IdKeyedObject | null> {
		try {
			const raw = await readFile(this.resolve(table, id));
			return deserialize(raw);
		} catch {
			return null;
		}
	}

	public create(table: string, id: string, data: SettingsObject = {}): Promise<void> {
		return outputFileAtomic(this.resolve(table, id), serialize({ id, ...this.parseUpdateInput(data) }));
	}

	public async update(table: string, id: string, data: SettingsObject): Promise<void> {
		const existent = await this.get(table, id) as Record<PropertyKey, unknown>;
		const parsed = this.parseUpdateInput(data) as Record<PropertyKey, unknown>;
		return outputFileAtomic(this.resolve(table, id), serialize(mergeObjects(existent || { id }, parsed)));
	}

	public replace(table: string, id: string, data: SettingsObject): Promise<void> {
		return outputFileAtomic(this.resolve(table, id), serialize({ id, ...this.parseUpdateInput(data) }));
	}

}
