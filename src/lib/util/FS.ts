import { ReadTOMLOptions, TomlOptions } from '../types/Interfaces';
import * as TOML from '@iarna/toml';
import { dirname } from 'path';
import { readFile, writeFile, writeFileAtomic, mkdirs } from 'fs-nextra';

const stripBom = (content: string | Buffer): string => {
	if (Buffer.isBuffer(content)) content = content.toString('utf8');
	return content.replace(/^\uFEFF/, '');
};

export async function readTOML(file: string, options: ReadTOMLOptions | BufferEncoding = { flag: 'r' }): Promise<any> {
	if (typeof options === 'string') options = { encoding: options, flag: 'r' };
	const content = await readFile(file, options);
	return TOML.parse(stripBom(content));
}

export async function writeTOML(file: string, object: any, atomic?: boolean): Promise<void>;
export async function writeTOML(file: string, object: any, options?: TomlOptions, atomic?: boolean): Promise<void>;
export async function writeTOML(file: string, object: any, options: TomlOptions | boolean = {}, atomic = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];

	const writeMethod = atomic ? writeFileAtomic : writeFile;
	await writeMethod(file, `${TOML.stringify(object)}`);
}

export async function writeTOMLAtomic(file: string, object: any, options: TomlOptions = {}): Promise<void> {
	return writeTOML(file, object, options, true);
}

export async function outputTOML(file: string, data: any, atomic?: boolean): Promise<void>;
export async function outputTOML(file: string, data: any, options?: TomlOptions, atomic?: boolean): Promise<void>;
export async function outputTOML(file: string, data: any, options?: TomlOptions | boolean, atomic = false): Promise<void> {
	if (typeof options === 'boolean') [atomic, options] = [options, {}];
	await mkdirs(dirname(file));
	return writeTOML(file, data, options, atomic);
}

export async function outputTOMLAtomic(file: string, data: any, options?: TomlOptions): Promise<void> {
	return outputTOML(file, data, options, true);
}

