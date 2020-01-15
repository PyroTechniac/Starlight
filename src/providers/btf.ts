import { FileSystemProvider } from '../lib/util/FileSystemProvider';
import { KeyedObject } from 'klasa';
import { outputBTFAtomic, readBTF } from '../lib/util/FS';

export default class extends FileSystemProvider {

	public read(file: string): Promise<KeyedObject> {
		return readBTF(file);
	}

	public write(file: string, data: object): Promise<void> {
		return outputBTFAtomic(file, data);
	}

}
