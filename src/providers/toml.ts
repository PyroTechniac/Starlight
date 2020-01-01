import { FileSystemProvider } from '../lib/util/BaseProvider';
import { outputTOMLAtomic, readTOML } from '../lib/util/FS';
import { KeyedObject } from 'klasa';

export default class extends FileSystemProvider {

	public read(file: string): Promise<KeyedObject> {
		return readTOML(file);
	}

	public write(file: string, data: object): Promise<void> {
		return outputTOMLAtomic(file, data);
	}

}
