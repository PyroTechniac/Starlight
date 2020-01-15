import { Provider as BaseProvider, SchemaEntry, SQLProvider as BaseSQLProvider, Type } from 'klasa';
import { isNumber, makeObject } from '@klasa/utils';
import { AnyObject } from '../types/Types';
import { isSchemaFolder } from './Utils';


export abstract class Provider extends BaseProvider {

	protected get shouldUnload(): boolean {
		return this.client.options.providers.default !== this.name;
	}

}

export abstract class SQLProvider extends BaseSQLProvider {

	protected get shouldUnload(): boolean {
		return this.client.options.providers.default !== this.name;
	}

	protected cValue(table: string, key: string, value: unknown): string {
		const gateway = this.client.gateways.get(table);
		if (typeof gateway === 'undefined') return this.cUnknown(value);

		const entry = gateway.schema.get(key);
		if (!entry || isSchemaFolder(entry)) return this.cUnknown(value);

		const qbEntry = this.qb.get(entry.type);
		return qbEntry
			? entry.array
				? qbEntry.arraySerializer(value as unknown[], entry, qbEntry.serializer)
				: qbEntry.serializer(value, entry)
			: this.cUnknown(value);
	}

	protected cValues(table: string, keys: readonly string[], values: readonly unknown[]): string[] {
		const gateway = this.client.gateways.get(table);
		if (typeof gateway === 'undefined') return values.map(this.cUnknown.bind(this));

		const { schema } = gateway;
		const parsedValues: string[] = [];
		for (let i = 0; i < keys.length; ++i) {
			const key = keys[i];
			const value = values[i];
			const entry = schema.get(key);
			if (!entry || isSchemaFolder(entry)) {
				parsedValues.push(this.cUnknown(value));
				continue;
			}

			const qbEntry = this.qb.get(entry.type);
			parsedValues.push(qbEntry
				? entry.array
					? qbEntry.arraySerializer(value as unknown[], entry, qbEntry.serializer)
					: value === null
						? 'NULL'
						: qbEntry.serializer(value, entry)
				: this.cUnknown(value));
		}
		return parsedValues;
	}

	protected parseSQLEntry(table: string, raw: Record<string, unknown> | null): Record<string, unknown> | null {
		if (!raw) return null;

		const gateway = this.client.gateways.get(table);
		if (typeof gateway === 'undefined') return raw;

		const obj: Record<string, unknown> = { id: raw.id };
		for (const entry of gateway.schema.values(true)) {
			makeObject(entry.path, this.parseValue(raw[entry.path], entry), obj);
		}

		return obj;
	}

	protected parseValue(value: unknown, schemaEntry: SchemaEntry): unknown {
		if (value === null || typeof value === 'undefined') return schemaEntry.default;
		return Array.isArray(value)
			? value.map((element): unknown => this.parsePrimitiveValue(element, schemaEntry.type))
			: this.parsePrimitiveValue(value, schemaEntry.type);
	}

	protected parsePrimitiveValue(value: unknown, type: string): unknown {
		switch (type) {
			case 'number':
			case 'float': {
				const float = typeof value === 'string' ? Number.parseFloat(value) : value;
				return isNumber(float) ? float : null;
			}
			case 'integer': {
				const int = typeof value === 'string' ? Number.parseInt(value, 10) : value;
				return isNumber(int) ? int : null;
			}
			case 'string':
				return typeof value === 'string' ? value.trim() : null;
			default:
				return value;
		}
	}

	protected cIdentifier(input: string): string {
		return `"${input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
	}

	protected cString(value: string): string {
		return `'${value.replace(/'/g, '\'\'')}'`;
	}

	protected cNumber(value: number | bigint): string {
		return value.toString();
	}

	protected cBoolean(value: boolean): string {
		return value ? 'TRUE' : 'FALSE';
	}

	protected cDate(value: Date): string {
		return this.cNumber(value.getTime());
	}

	protected cJson(value: AnyObject): string {
		return this.cString(JSON.stringify(value));
	}

	protected cArray(value: readonly unknown[]): string {
		return `${value.map(this.cUnknown.bind(this)).join(', ')}`;
	}

	protected cUnknown(value: unknown): string {
		switch (typeof value) {
			case 'string':
				return this.cString(value);
			case 'bigint':
			case 'number':
				return this.cNumber(value);
			case 'boolean':
				return this.cBoolean(value);
			case 'object':
				if (value === null) return 'NULL';
				if (Array.isArray(value)) return this.cArray(value);
				if (value instanceof Date) return this.cDate(value);
				return this.cJson(value);
			case 'undefined':
				return 'NULL';
			default:
				throw new TypeError(`Cannot serialize a ${new Type(value)}`);
		}
	}

}
