import { ProviderStore, QueryBuilder, SQLProvider, util, SchemaEntry, SchemaFolder, SettingsFolderUpdateResultEntry } from 'klasa';
import { Pool, PoolClient } from 'pg';
import { parseRange, sanitizeKeyName } from '../lib/util';
const { mergeDefault } = util;

declare module 'klasa' {
    interface Gateway {
        idLength: number;
    }
}

/* eslint-disable */

export default class extends SQLProvider {
    public qb: QueryBuilder;
    public db: Pool | null;
    public dbConnection: PoolClient | null;
    public constructor(store: ProviderStore, file: string[], directory: string) {
        super(store, file, directory);
        this.qb = new QueryBuilder({
            array: (type): string => `${type}[]`,
            arraySerializer: (values, piece, resolver): string =>
                values.length ? `array[${values.map((value): string => resolver(value, piece)).join(', ')}]` : "'{}'",
            formatDatatype: (name, datatype, def = null): string => `"${name}" ${datatype}${def !== null ? `NOT NULL DEFAULT ${def}` : ''}`
        })
            .add('boolean', { type: 'BOOL' })
            .add('integer', { type: ({ max }): string => max! >= 2 ** 32 ? 'BIGINT' : 'NUMBER' })
            .add('float', { type: 'DOUBLE PRECISION' })
            .add('uuid', { type: 'UUID' })
            .add('any', { type: "JSON", serializer: (input): string => `'${JSON.stringify(input)}'::json` })
            .add('json', { extends: 'any' })
        this.db = null;
        this.dbConnection = null
    }

    public async init(): Promise<void> {
        const connection = mergeDefault({
            host: 'localhost',
            port: 5432,
            database: 'klasa',
            options: {
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000
            }
        }, this.client.options.providers.postgresql);
        this.db = new Pool({
            ...connection.options,
            host: connection.host,
            port: connection.port,
            user: connection.user,
            password: connection.password,
            database: connection.database
        });

        this.db.on('error', (err): boolean => this.client.emit('error', err));
        this.dbConnection = await this.db.connect()
    }

    public shutdown(): Promise<void> {
        this.dbConnection!.release();
        return this.db!.end()
    }

    hasTable(table) {
        return this.runAll(`SELECT true FROM pg_tables WHERE tablename = '${table}';`)
            .then(result => result.length !== 0 && result[0].bool === true)
            .catch(() => false);
    }

    createTable(table, rows) {
        if (rows) return this.run(`CREATE TABLE ${sanitizeKeyName(table)} (${rows.map(([k, v]) => `${sanitizeKeyName(k)} ${v}`).join(', ')});`);
        const gateway = this.client.gateways.get(table);
        if (!gateway) throw new Error(`There is no gateway defined with the name ${table} nor an array of rows with datatypes have been given. Expected any of either.`);

        const schemaValues = [...gateway.schema.values(true)];
        return this.run(`
			CREATE TABLE ${sanitizeKeyName(table)} (
				${[`id VARCHAR(${gateway.idLength || 18}) PRIMARY KEY NOT NULL UNIQUE`, ...schemaValues.map(this.qb.generateDatatype.bind(this.qb))].join(', ')}
			)`
        );
    }

    deleteTable(table) {
        return this.run(`DROP TABLE IF EXISTS ${sanitizeKeyName(table)};`);
    }

    countRows(table) {
        return this.runOne(`SELECT COUNT(*) FROM ${sanitizeKeyName(table)};`)
            .then(result => Number(result.count));
    }

    /* Row methods */

    getAll(table, entries = []) {
        if (entries.length) {
            return this.runAll(`SELECT * FROM ${sanitizeKeyName(table)} WHERE id IN ('${entries.join("', '")}');`)
                .then(results => results.map(output => this.parseEntry(table, output)));
        }
        return this.runAll(`SELECT * FROM ${sanitizeKeyName(table)};`)
            .then(results => results.map(output => this.parseEntry(table, output)));
    }

    getKeys(table) {
        return this.runAll(`SELECT id FROM ${sanitizeKeyName(table)};`)
            .then(rows => rows.map(row => row.id));
    }

    // @ts-ignore
    get(table, key, value) {
        // If a key is given (id), swap it and search by id - value
        if (typeof value === 'undefined') {
            value = key;
            key = 'id';
        }
        return this.runOne(`SELECT * FROM ${sanitizeKeyName(table)} WHERE ${sanitizeKeyName(key)} = $1 LIMIT 1;`, [value])
            .then(output => this.parseEntry(table, output));
    }

    has(table, id) {
        return this.runOne(`SELECT id FROM ${sanitizeKeyName(table)} WHERE id = $1 LIMIT 1;`, [id])
            .then(result => Boolean(result));
    }

    getRandom(table) {
        return this.runOne(`SELECT * FROM ${sanitizeKeyName(table)} ORDER BY RANDOM() LIMIT 1;`);
    }

    getSorted(table, key, order = 'DESC', limitMin, limitMax) {
        return this.runAll(`SELECT * FROM ${sanitizeKeyName(table)} ORDER BY ${sanitizeKeyName(key)} ${order} ${parseRange(limitMin, limitMax)};`);
    }

    public create(table: string, id: any, data: SettingsFolderUpdateResultEntry[] | [string, any][] | Record<string, any> | undefined): Promise<any> {
        const [keys, values] = this.parseUpdateInput(data, false);

        if (!keys.includes('id')) {
            keys.push('id');
            values.push(id);
        }
        return this.run(`
            INSERT INTO ${sanitizeKeyName(table)} (${keys.map(sanitizeKeyName).join(', ')})
            VALUES (${Array.from({ length: keys.length }, (__, i) => `$${i + 1}`).join(', ')});`, values);
    }

    public update(table: string, id: string, data: SettingsFolderUpdateResultEntry[] | [string, any][] | Record<string, any> | undefined): Promise<any> {
        const [keys, values] = this.parseUpdateInput(data, false);
        return this.run(`
			UPDATE ${sanitizeKeyName(table)}
			SET ${keys.map((key: string, i: number): string => `${sanitizeKeyName(key)} = $${i + 1}`)}
			WHERE id = '${id.replace(/'/, "''")}';`, values);
    }

    public replace(table: string, id: string, data: SettingsFolderUpdateResultEntry[] | [string, any][] | Record<string, any> | undefined): Promise<any> {
        return this.update(table, id, data);
    }

    public incrementValue(table: string, id: any, key: any, amount = 1): Promise<any> {
        return this.run(`UPDATE ${sanitizeKeyName(table)} SET $2 = $2 + $3 WHERE id = $1;`, [id, key, amount]);
    }

    public decrementValue(table: string, id: any, key: any, amount = 1): Promise<any> {
        return this.run(`UPDATE ${sanitizeKeyName(table)} SET $2 = GREATEST(0, $2 - $3) WHERE id = $1;`, [id, key, amount]);
    }

    public delete(table: string, id: any): Promise<any> {
        return this.run(`DELETE FROM ${sanitizeKeyName(table)} WHERE id = $1;`, [id]);
    }

    public addColumn(table: string, piece: any): Promise<any> {
        return this.run(piece.type !== 'Folder' ?
            `ALTER TABLE ${sanitizeKeyName(table)} ADD COLUMN ${this.qb.generateDatatype(piece)};` :
            `ALTER TABLE ${sanitizeKeyName(table)} ${[...piece.values(true)].map((subpiece): string => `ADD COLUMN ${this.qb.generateDatatype(subpiece)}`).join(', ')};`);
    }

    public removeColumn(table: string, columns: string | string[]): Promise<any> {
        if (typeof columns === 'string') return this.run(`ALTER TABLE ${sanitizeKeyName(table)} DROP COLUMN ${sanitizeKeyName(columns)};`);
        if (Array.isArray(columns)) return this.run(`ALTER TABLE ${sanitizeKeyName(table)} DROP COLUMN ${columns.map(sanitizeKeyName).join(', ')};`)
        throw new TypeError('Invalid usage of PostgreSQL#removeColumn. Expected a string or string[].');
    }

    public updateColumn(table: string, piece: SchemaEntry): Promise<any> {
        const [column, datatype] = this.qb.generateDatatype(piece).split(' ');
        return this.run(`ALTER TABLE ${sanitizeKeyName(table)} ALTER COLUMN ${column} TYPE ${datatype}${piece.default ?
            `, ALTER COLUMN ${column} SET NOT NULL, ALTER COLUMN ${column} SET DEFAULT ${this.qb.serialize(piece.default, piece)}` : ''
            };`);
    }

    public getColumns(table: any, schema = 'public'): Promise<string[]> {
        return this.runAll(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = $1
                AND table_name = $2;
        `, [schema, table]).then((result): string[] => result.map((row): string => row.column_name));
    }

    public run(...sql: any[]): Promise<any> {
        // @ts-ignore
        return this.db!.query(...sql)
            .then((result: any): any => result);
    }

    public runAll(...sql: any[]): Promise<any[]> {
        return this.run(...sql)
            .then((result): any[] => result.rows)
    }

    public runOne(...sql: any[]): Promise<any> {
        return this.run(...sql)
            .then((result): any => result.rows[0]);
    }
}