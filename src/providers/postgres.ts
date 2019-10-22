import { QueryBuilder, util, Type, SettingsFolderUpdateResult, SchemaFolder, SchemaEntry } from 'klasa';
import { Pool, PoolClient, PoolConfig, Submittable, QueryArrayConfig, QueryArrayResult, QueryResultRow, QueryConfig, QueryResult } from 'pg';
import { Events } from '../lib/types/Enums';
import { SQLProvider } from '../lib/util/BaseProvider';

const { mergeDefault, isNumber } = util;

export default class extends SQLProvider {

	public qb = new QueryBuilder({
		array: (type): string => `${type}[]`,
		arraySerializer: (values, piece, resolver): string =>
			values.length ? `array[${values.map((value): string => resolver(value, piece)).join(', ')}]` : '\'{}\'',
		formatDatatype: (name, datatype, def = null): string => `"${name}" ${datatype}${def === null ? '' : ` NOT NULL DEFAULT ${def}`}`
	})
		.add('boolean', { type: 'BOOL' })
		.add('integer', { type: ({ max }): string => max !== null && max >= 2 ** 32 ? 'BIGINT' : 'INTEGER' })
		.add('float', { type: 'DOUBLE PRECISION' })
		.add('uuid', { type: 'UUID' })
		.add('any', { type: 'JSON', serializer: input => `'${JSON.stringify(input)}'::json` })
		.add('json', { 'extends': 'any' });

	public db: Pool | null = null;

	public conn: PoolClient | null = null;

	public async init(): Promise<void> {
		if (this.shouldUnload) return this.unload();

		const poolOptions = mergeDefault<PoolConfig, PoolConfig>({
			host: 'localhost',
			port: 5432,
			database: 'klasa',
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000
		}, this.client.options.providers.postgres);

		this.db = new Pool(poolOptions)
			.on('error', (error): boolean => this.client.emit(Events.Error, error));
		this.conn = await this.db.connect();
	}

	public async shutdown(): Promise<void> {
		if (this.conn) this.conn.release();
		if (this.db) await this.db.end();
	}

	public async hasTable(table: string): Promise<boolean> {
		try {
			const results = await this.runAll(`SELECT true FROM pg_tables WHERE tablename = '${table}';`);
			return results.length !== 0 && results[0].bool === true;
		} catch {
			return false;
		}
	}

	public createTable(table: string, rows?: readonly any[]): Promise<QueryResult> {
		if (rows) return this.run(`CREATE TABLE ${sanitizeKeyName(table)} (${rows.map(([k, v]) => `${sanitizeKeyName(k)} ${v}`).join(', ')});`);
		const gateway = this.client.gateways.get(table);
		if (!gateway) throw new Error(`There is no gateway defined with the name ${table} nor an array of rows with datatypes have been given. Expected any of either.`);

		const schemaValues = [...gateway.schema.values(true)];
		const idLength = 18;

		return this.run(`
                CREATE TABLE ${sanitizeKeyName(table)} (
                    ${[`id VARCHAR(${idLength}) PRIMARY KEY NOT NULL UNIQUE`, ...schemaValues.map(this.qb.generateDatatype.bind(this.qb))].join(', ')}
                )`);
	}

	public deleteTable(table: string): Promise<QueryResult> {
		return this.run(`DROP TABLE IF EXISTS ${sanitizeKeyName(table)};`);
	}

	public async countRows(table: string): Promise<number> {
		const results = await this.runOne(`SELECT COUNT(*) FROM ${sanitizeKeyName(table)};`);
		return Number(results.count);
	}

	public async getAll(table: string, entries: readonly string[] = []): Promise<unknown[]> {
		if (entries.length) {
			const results = await this.runAll(`SELECT * FROM ${sanitizeKeyName(table)} WHERE id IN ('${entries.join('\', \'')}');`);
			return results.map((output): Record<string, unknown> => this.parseEntry(table, output));
		}

		const results = await this.runAll(`SELECT * FROM ${sanitizeKeyName(table)};`);
		return results.map((output): Record<string, unknown> => this.parseEntry(table, output));
	}

	public async getKeys(table: string): Promise<string[]> {
		const rows = await this.runAll(`SELECT id FROM ${sanitizeKeyName(table)};`);
		return rows.map((row): string => row.id);
	}

	public async get(table: string, key: string, value?: unknown): Promise<unknown> {
		if (typeof value === 'undefined') {
			value = key;
			key = 'id';
		}

		const output = await this.runOne(`SELECT * FROM ${sanitizeKeyName(table)} WHERE ${sanitizeKeyName(key)} = $1 LIMIT 1;`, [value]);
		return this.parseEntry(table, output);
	}

	public async has(table: string, id: string): Promise<boolean> {
		const result = await this.runOne(`SELECT id FROM ${sanitizeKeyName(table)} WHERE id = $1 LIMIT 1;`, [id]);
		return Boolean(result);
	}

	public async getRandom(table: string): Promise<unknown[]> {
		return this.runAll(`SELECT * FROM ${sanitizeKeyName(table)} ORDER BY RANDOM() LIMIT 1;`);
	}

	public getSorted(table: string, key: string, order: 'ASC' | 'DESC' = 'DESC', limitMin?: number, limitMax?: number): Promise<unknown[]> {
		return this.runAll(`SELECT * FROM ${sanitizeKeyName(table)} ORDER BY ${sanitizeKeyName(key)} ${order} ${parseRange(limitMin, limitMax)};`);
	}

	public create(table: string, id: string, data: CreateOrUpdateValue): Promise<QueryResult> {
		const [keys, values] = this.parseUpdateInput(data, false);

		// Push the id to the inserts.
		if (!keys.includes('id')) {
			keys.push('id');
			values.push(id);
		}
		return this.db!.query(`
			    INSERT INTO ${sanitizeKeyName(table)} (${keys.map(sanitizeKeyName).join(', ')})
			    VALUES (${Array.from({ length: keys.length }, (__, i) => `$${i + 1}`).join(', ')});`, values);
	}

	public update(table: string, id: string, data: CreateOrUpdateValue): Promise<QueryResult> {
		const [keys, values] = this.parseUpdateInput(data, false);
		return this.db!.query(`
                UPDATE ${sanitizeKeyName(table)}
                SET ${keys.map((key, i: number) => `${sanitizeKeyName(key)} = $${i + 1}`)}
                WHERE id = '${id.replace(/'/g, '\'\'')}';`, values);
	}

	public replace(table: string, id: string, data: CreateOrUpdateValue): Promise<QueryResult> {
		return this.update(table, id, data);
	}

	public incrementValue(table: string, id: string, key: string, amount = 1): Promise<QueryResult> {
		return this.run(`UPDATE ${sanitizeKeyName(table)} SET $2 = $2 + $3 WHERE id = $1;`, [id, key, amount]);
	}

	public decrementValue(table: string, id: string, key: string, amount = 1): Promise<QueryResult> {
		return this.run(`UPDATE ${sanitizeKeyName(table)} SET $2 = GREATEST(0, $2 - $3) WHERE id = $1;`, [id, key, amount]);
	}

	public delete(table: string, id: string): Promise<QueryResult> {
		return this.run(`DELETE FROM ${sanitizeKeyName(table)} WHERE id = $1;`, [id]);
	}

	public addColumn(table: string, column: SchemaFolder | SchemaEntry): Promise<QueryResult> {
		return this.run(column instanceof SchemaFolder
			? `ALTER TABLE ${sanitizeKeyName(table)} ${[...column.values(true)].map(subpiece => `ADD COLUMN ${this.qb.generateDatatype(subpiece)}`).join(', ')};`
			: `ALTER TABLE ${sanitizeKeyName(table)} ADD COLUMN ${this.qb.generateDatatype(column)};`);
	}

	public removeColumn(table: string, columns: string | string[]): Promise<QueryResult> {
		if (typeof columns === 'string') return this.run(`ALTER TABLE ${sanitizeKeyName(table)} DROP COLUMN ${sanitizeKeyName(columns)};`);
		if (Array.isArray(columns)) return this.run(`ALTER TABLE ${sanitizeKeyName(table)} DROP COLUMN ${columns.map(sanitizeKeyName).join(', ')};`);
		throw new TypeError('Invalid usage of PostgreSQL#removeColumn. Expected a string or string[].');
	}

	public updateColumn(table: string, entry: SchemaEntry): Promise<QueryResult> {
		const [column, datatype] = this.qb.generateDatatype(entry).split(' ');
		return this.db!.query(`ALTER TABLE ${sanitizeKeyName(table)} ALTER COLUMN ${column} TYPE ${datatype}${entry.default
			? `, ALTER COLUMN ${column} SET NOT NULL, ALTER COLUMN ${column} SET DEFAULT ${this.qb.serialize(entry.default, entry)}`
			: ''
		};`);
	}

	public async getColumns(table: string, schema = 'public'): Promise<string[]> {
		const result = await this.runAll(`
			    SELECT column_name
			    FROM information_schema.columns
			    WHERE table_schema = $1
				    AND table_name = $2;
		`, [schema, table]);
		return result.map((row): string => row.column_name);
	}

	/* eslint-disable @typescript-eslint/explicit-function-return-type */
	public run<T extends Submittable>(queryStream: T): T;
	public run<R extends unknown[] = unknown[], I extends unknown[] = unknown[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>>;
	public run<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>>;
	public run<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>>;
	public run(...sql: readonly unknown[]) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2556
		return this.pgsql!.query(...sql);
	}

	public async runAll<R extends unknown[] = unknown[], I extends unknown[] = unknown[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>['rows']>;
	public async runAll<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>['rows']>;
	public async runAll<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>['rows']>;
	public async runAll(...sql: readonly unknown[]) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2556
		const results = await this.run(...sql);
		return results.rows;
	}

	public async runOne<R extends unknown[] = unknown[], I extends unknown[] = unknown[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>['rows'][number]>;
	public async runOne<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>['rows'][number]>;
	public async runOne<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>['rows'][number]>;
	public async runOne(...sql: readonly unknown[]) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2556
		const results = await this.run(...sql);
		return results.rows[0] || null;
	}
	/* eslint-enable @typescript-eslint/explicit-function-return-type */

}

function sanitizeKeyName(value: string): string {
	if (typeof value !== 'string') throw new TypeError(`[SANITIZE_NAME] Expected a string, got: ${new Type(value)}`);
	if (/`|"/.test(value)) throw new TypeError(`Invalid input (${value}).`);
	if (value.startsWith('"') && value.endsWith('"')) return value;
	return `"${value}"`;
}

function parseRange(min?: number, max?: number): string {
	// Min value validation
	if (typeof min === 'undefined') return '';
	if (!isNumber(min)) {
		throw new TypeError(`[PARSE_RANGE] 'min' parameter expects an integer or undefined, got ${min}`);
	}
	if (min < 0) {
		throw new RangeError(`[PARSE_RANGE] 'min' parameter expects to be equal or greater than zero, got ${min}`);
	}

	// Max value validation
	if (typeof max !== 'undefined') {
		if (!isNumber(max)) {
			throw new TypeError(`[PARSE_RANGE] 'max' parameter expects an integer or undefined, got ${max}`);
		}
		if (max <= min) {
			throw new RangeError(`[PARSE_RANGE] 'max' parameter expects ${max} to be greater than ${min}. Got: ${max} <= ${min}`);
		}
	}

	return `LIMIT ${min}${typeof max === 'number' ? `,${max}` : ''}`;
}

type CreateOrUpdateValue = SettingsFolderUpdateResult[] | [string, unknown][] | Record<string, unknown>;
