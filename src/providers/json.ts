import { FileSystemProvider } from '../lib/util/BaseProvider';
import { outputJSONAtomic, readJSON } from 'fs-nextra';
import { KeyedObject } from 'klasa';

export default class extends FileSystemProvider {

	public read(file: string): Promise<KeyedObject> {
		return readJSON(file);
	}

	public write(path: string, data: object): Promise<void> {
		return outputJSONAtomic(path, data, { spaces: 4 });
	}

}
