import { FileSystemProvider } from '../lib/util/FileSystemProvider';
import { outputYAMLAtomic, readYAML } from '../lib/util/FS';
import { KeyedObject } from 'klasa';

export default class extends FileSystemProvider {

	public get extension(): string {
		return 'yml';
	}

	public read(file: string): Promise<KeyedObject> {
		return readYAML(file);
	}

	public write(file: string, data: object): Promise<void> {
		return outputYAMLAtomic(file, data);
	}

}
