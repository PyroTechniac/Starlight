import { FileSystemProvider } from '../lib/util/BaseProvider';
import { readTOML, outputTOMLAtomic } from '../lib/util/FS';
import { mergeObjects } from '@klasa/utils';
import {IdKeyedObject} from "klasa";
import {SettingsObject} from "../lib/types/Types";

export default class extends FileSystemProvider {

	public async get(table: string, id: string): Promise<IdKeyedObject | null> {
		try {
			return await readTOML(this.resolve(table, id));
		} catch {
			return null;
		}
	}

	public create(table: string, id: string, data: SettingsObject = {}): Promise<void> {
		return outputTOMLAtomic(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

	public async update(table: string, id: string, data: SettingsObject): Promise<void> {
		const existent = await this.get(table, id) as Record<PropertyKey, unknown>;
		const parsed = this.parseUpdateInput(data) as Record<PropertyKey, unknown>;
		return outputTOMLAtomic(this.resolve(table, id), mergeObjects(existent || { id }, parsed));
	}

	public replace(table: string, id: string, data: SettingsObject): Promise<void> {
		return outputTOMLAtomic(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

}
