import { Engine } from '../util/Engine';
import { Schema, SchemaEntry, SettingsFolder } from 'klasa';
import Collection from '@discordjs/collection';
import { Guild } from 'discord.js';
import { cast } from '../util/Utils';
import { toTitleCase } from '@klasa/utils';
import { Databases } from '../types/Enums';

export class SchemaEngine extends Engine {

	public configurable: Collection<string, Schema | SchemaEntry> = new Collection<string, Schema | SchemaEntry>();

	public initAll(): void {
		for (const [name, { schema }] of this.client.gateways) {
			if (this.init(name, schema)) this.configurable.set(`${name}/${schema.path}`, schema);
		}
	}

	public get(prefix: Databases, path: string): Schema | SchemaEntry | undefined {
		return this.configurable.get(`${prefix}/${path}`);
	}

	public displayFolder(prefix: string, settings: SettingsFolder): string {
		const array: string[] = [];
		const folders: string[] = [];
		const sections = new Map<string, string[]>();
		let longest = 0;
		const guild = settings.base!.target instanceof Guild ? settings.base!.target : null;

		for (const [key, value] of settings.schema.entries()) {
			if (!this.configurable.has(`${prefix}/${value.path}`)) continue;

			if (this.isSchemaFolder(value)) {
				folders.push(`// ${key}`);
			} else {
				const values = sections.get(value.type) || [];
				values.push(key);

				if (key.length > longest) longest = key.length;
				if (values.length === 1) sections.set(value.type, values);
			}
		}
		if (folders.length) array.push('= Folders =', ...folders.sort(), '');
		if (sections.size) {
			for (const keyType of [...sections.keys()].sort()) {
				array.push(`= ${toTitleCase(keyType)}s =`,
					...sections.get(keyType)!.sort().map((key): string => `${key.padEnd(longest)} :: ${this.displayEntry(cast<SchemaEntry>(settings.schema.get(key)), settings.get(key), guild)}`),
					'');
			}
		}

		return array.join('\n');
	}

	public displayEntry(entry: SchemaEntry, value: unknown, guild: Guild | null = null): string {
		return entry.array
			? this.displayEntryMultiple(entry, cast<readonly unknown[]>(value), guild)
			: this.displayEntrySingle(entry, value, guild);
	}

	public displayEntryMultiple(entry: SchemaEntry, values: readonly unknown[], guild: Guild | null): string {
		return values.length === 0
			? 'None'
			: `[ ${values.map((val): string => this.displayEntrySingle(entry, val, guild)).join(' | ')} ]`;
	}

	public displayEntrySingle(entry: SchemaEntry, value: unknown, guild: Guild | null): string {
		return entry.serializer.stringify(value, guild) || 'Not set';
	}

	public init(prefix: string, schema: Schema): boolean {
		const previous = this.filteredKeys(prefix).size;

		for (const value of schema.values()) {
			if (this.isSchemaFolder(value)) {
				if (this.init(prefix, value)) this.configurable.set(`${prefix}/${value.path}`, value);
			} else if (value.configurable) {
				this.configurable.set(`${prefix}/${value.path}`, value);
			}
		}

		return previous !== this.filteredKeys(prefix).size;
	}

	public isSchemaFolder(input: Schema | SchemaEntry): input is Schema {
		return input.type === 'Folder';
	}

	public isSchemaEntry(input: Schema | SchemaEntry): input is SchemaEntry {
		return input.type !== 'Folder';
	}

	private filteredKeys(prefix: string): Collection<string, Schema | SchemaEntry> {
		return this.configurable.filter((_, key): boolean => key.startsWith(prefix));
	}

}
