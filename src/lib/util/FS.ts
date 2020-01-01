import { BtfOptions, ReadTOMLOptions, ReadYAMLOptions, TomlOptions, YamlOptions } from '../types/Interfaces';
import * as TOML from '@iarna/toml';
import { dirname } from 'path';
import { mkdirs, readFile, writeFile, writeFileAtomic } from 'fs-nextra';
import * as YAML from 'js-yaml';
import { deserialize, serialize } from 'binarytf';

const stripBom = (content: string | Buffer): string => {
	if (Buffer.isBuffer(content)) content = content.toString('utf8');
	return content.replace(/^\uFEFF/, '');
};

export async function readTOML(file: string, options: ReadTOMLOptions | BufferEncoding = { flag: 'r' }): Promise<any> {
	if (typeof options === 'string') options = { encoding: options, flag: 'r' };
	const content = await readFile(file, options);
	return TOML.parse(stripBom(content));
}

export async function readYAML(file: string, options: ReadYAMLOptions | BufferEncoding = { flag: 'r' }): Promise<any> {
	if (typeof options === 'string') options = { encoding: options, flag: 'r' };
	const content = await readFile(file, options);
	return YAML.load(stripBom(content));
}

export async function readBTF(file: string): Promise<any> {
	const content = await readFile(file);
	return deserialize(content);
}

export async function writeTOML(file: string, object: any, atomic?: boolean): Promise<void>;
export async function writeTOML(file: string, object: any, options?: TomlOptions, atomic?: boolean): Promise<void>;
export async function writeTOML(file: string, object: any, options: TomlOptions | boolean = {}, atomic = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];

	const writeMethod = atomic ? writeFileAtomic : writeFile;
	await writeMethod(file, `${TOML.stringify(object)}`, options);
}

export async function writeYAML(file: string, object: any, atomic?: boolean): Promise<void>;
export async function writeYAML(file: string, object: any, options?: YamlOptions, atomic?: boolean): Promise<void>;
export async function writeYAML(file: string, object: any, options: YamlOptions | boolean = {}, atomic = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];

	const writeMethod = atomic ? writeFileAtomic : writeFile;
	await writeMethod(file, `${YAML.dump(object)}`, options);
}

export async function writeBTF(file: string, object: any, atomic?: boolean): Promise<void>;
export async function writeBTF(file: string, object: any, options?: BtfOptions, atomic?: boolean): Promise<void>;
export async function writeBTF(file: string, object: any, options: BtfOptions | boolean = {}, atomic = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];

	const writeMethod = atomic ? writeFileAtomic : writeFile;
	await writeMethod(file, serialize(object));
}

export async function writeTOMLAtomic(file: string, object: any, options: TomlOptions = {}): Promise<void> {
	return writeTOML(file, object, options, true);
}

export async function writeYAMLAtomic(file: string, object: any, options: YamlOptions = {}): Promise<void> {
	return writeYAML(file, object, options, true);
}

export async function writeBTFAtomic(file: string, object: any, options: BtfOptions = {}): Promise<void> {
	return writeBTF(file, object, options, true);
}

export async function outputTOML(file: string, data: any, atomic?: boolean): Promise<void>;
export async function outputTOML(file: string, data: any, options?: TomlOptions, atomic?: boolean): Promise<void>;
export async function outputTOML(file: string, data: any, options?: TomlOptions | boolean, atomic = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];
	await mkdirs(dirname(file));
	return writeTOML(file, data, options, atomic);
}

export async function outputYAML(file: string, data: any, atomic?: boolean): Promise<void>;
export async function outputYAML(file: string, data: any, options?: YamlOptions, atomic?: boolean): Promise<void>;
export async function outputYAML(file: string, data: any, options?: YamlOptions | boolean, atomic = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];
	await mkdirs(dirname(file));
	return writeYAML(file, data, options, atomic);
}

export async function outputBTF(file: string, data: any, atomic?: boolean): Promise<void>;
export async function outputBTF(file: string, data: any, options?: BtfOptions, atomic?: boolean): Promise<void>;
export async function outputBTF(file: string, data: any, options?: BtfOptions | boolean, atomic = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];
	await mkdirs(dirname(file));
	return writeBTF(file, data, options, atomic);
}

export async function outputTOMLAtomic(file: string, data: any, options?: TomlOptions): Promise<void> {
	return outputTOML(file, data, options, true);
}

export async function outputYAMLAtomic(file: string, data: any, options?: YamlOptions): Promise<void> {
	return outputYAML(file, data, options, true);
}

export async function outputBTFAtomic(file: string, data: any, options?: BtfOptions): Promise<void> {
	return outputBTF(file, data, options, true);
}
