import { ensureDir, ensureFile } from 'fs-nextra';
import { QueryBuilder, SQLProvider, Timestamp, util } from 'klasa';
import { resolve } from 'path';
import { Database, open, Statement } from 'sqlite';
import { Util } from '../lib';
import { SchemaFolder, SchemaEntry } from 'klasa';
const { chunk } = util;

/* eslint-disable @typescript-eslint/explicit-function-return-type */

const TIMEPARSERS = {
    DATE: new Timestamp('YYYY-MM-DD'),
    DATETIME: new Timestamp('YYYY-MM-DD hh:mm:ss')
};

export default class extends SQLProvider {
    private baseDir: string = resolve(this.client.userBaseDirectory, 'bwd', 'provider', 'sqlite');

    public qb: QueryBuilder = new QueryBuilder()
        .add('null', { type: 'NULL' })
        .add('integer', { type: ({ max }) => max! >= 2 ** 32 ? 'BIGINT' : 'INTEGER' })
        .add('float', { type: 'DOUBLE PRECISION' })
        .add('boolean', { type: 'TINYINT', serializer: (input: boolean): string => input ? '1' : '0' })
        .add('date', { type: 'DATETIME', serializer: (input): string => TIMEPARSERS.DATETIME.display(input) })
        .add('time', { extends: 'date' })
        .add('timestamp', { type: 'TIMESTAMP', serializer: (input: any): string => TIMEPARSERS.DATE.display(input) });

    private db: Database | null = null;

    public async init(): Promise<Database> {
        await ensureDir(this.baseDir);
        await ensureFile(resolve(this.baseDir, 'db.sqlite'));
        this.db = await open(resolve(this.baseDir, 'db.sqlite'));
        return this.db;
    }

    public async hasTable(table: string): Promise<boolean> {
        let boolean = await this.runGet(`SELECT name FROM sqlite_master WHERE type='table' AND name=${Util.sanitizeKeyName(table)};`);
        return Boolean(boolean);
    }

    public createTable(table: string, rows?: any[]): Promise<Statement> {
        if (rows) return this.run(`CREATE TABLE ${Util.sanitizeKeyName(table)} (${rows.map(([k, v]): string => `${Util.sanitizeKeyName(k)} ${v}`).join(', ')});`);
        const gateway = this.client.gateways.get(table);
        if (!gateway) throw new Error(`There is no gateway defined with the name ${table} nor an array of rows with datatypes have been given. Expected any of either.`);

        const schemaValues = [...gateway.schema.values(true)];

        return this.run(`
			CREATE TABLE ${Util.sanitizeKeyName(table)} (
				id VARCHAR(${18}) PRIMARY KEY NOT NULL UNIQUE${schemaValues.length ? `, ${schemaValues.map(this.qb.generateDatatype.bind(this.qb)).join(', ')}` : ''}
			);`
        );
    }

    public deleteTable(table: string): Promise<Statement> {
        return this.run(`DROP TABLE ${Util.sanitizeKeyName(table)};`);
    }

    public async getAll(table: string, entries: any[] = []) {
        let output: any[] = [];
        // @ts-ignore
        if (entries.length) for (const myChunk of chunk(entries, 999)) output.push(...await this.runAll(`SELECT * FROM ${Util.sanitizeKeyName(table)} WHERE id IN ( ${Util.valueList(myChunk.length)} );`, myChunk));
        else output = await this.runAll(`SELECT * FROM ${Util.sanitizeKeyName(table)};`);
        return output.map((entry): Record<string, any> => this.parseEntry(table, entry));
    }

    public get(table: string, key: string, value = null) {
        return this.runGet(value === null ?
            `SELECT * FROM ${Util.sanitizeKeyName(table)} WHERE id = ?;` :
            `SELECT * FROM ${Util.sanitizeKeyName(table)} WHERE ${Util.sanitizeKeyName(key)} = ?;`, [value ? Util.transformValue(value) : key])
            .then((entry): any => this.parseEntry(table, entry))
            .catch(Util.noop);
    }

    public async has(table: string, key: string): Promise<boolean> {
        try {
            await this.runGet(`SELECT id FROM ${Util.sanitizeKeyName(table)} WHERE id = ?;`, [key]);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    public getRandom(table: string): Promise<any> {
        return this.runGet(`SELECT * FROM ${Util.sanitizeKeyName(table)} ORDER BY RANDOM() LIMIT 1;`)
            .then((entry): any => this.parseEntry(table, entry))
            .catch(Util.noop);
    }

    public create(table: string, id: string, data: any): Promise<Statement> {
        const [keys, values] = this.parseUpdateInput(data, false);

        if (!keys.includes('id')) {
            keys.push('id');
            values.push(id);
        }
        return this.run(`INSERT INTO ${Util.sanitizeKeyName(table)} ( ${keys.map(Util.sanitizeKeyName).join(', ')} ) VALUES ( ${Util.valueList(values.length)} );`, values.map(Util.transformValue));
    }

    public update(table: string, id: string, data: any): Promise<Statement> {
        const [keys, values] = this.parseUpdateInput(data, false);
        return this.run(`
			UPDATE ${Util.sanitizeKeyName(table)}
			SET ${keys.map((key: any): string => `${Util.sanitizeKeyName(key)} = ?`)}
			WHERE id = ?;`, [...values.map(Util.transformValue), id]);
    }

    public replace(table: string, entryID: string, data: any): Promise<Statement> {
        return this.update(table, entryID, data);
    }

    public delete(table: string, row: string) {
        return this.run(`DELETE FROM ${Util.sanitizeKeyName(table)} WHERE id = ?;`, [row]);
    }

    public addColumn<T = Database>(table: string, piece: SchemaFolder | SchemaEntry): Promise<T> {
        // @ts-ignore
        return this.exec(`ALTER TABLE ${Util.sanitizeKeyName(table)} ADD ${Util.sanitizeKeyName(piece.path)} ${piece.type}`);
    }

    // @ts-ignore
    public async removeColumn(table, schemaPiece) {
        const gateway = this.client.gateways.get(table);
        if (!gateway) throw new Error(`There is no gateway defined with the name ${table}.`);

        const sanitizedTable = Util.sanitizeKeyName(table),
            sanitizedCloneTable = Util.sanitizeKeyName(`${table}_temp`);

        const allPieces = [...gateway.schema.values(true)];
        const index = allPieces.findIndex(piece => schemaPiece.path === piece.path);
        if (index === -1) throw new Error(`There is no key ${schemaPiece.key} defined in the current schema for ${table}.`);

        const filteredPieces = allPieces.slice();
        filteredPieces.splice(index, 1);

        const filteredPiecesNames = filteredPieces.map(piece => Util.sanitizeKeyName(piece.path)).join(', ');
        // @ts-ignore
        await this.createTable(sanitizedCloneTable, filteredPieces.map(this.qb.parse.bind(this.qb)));
        await this.exec([
            `INSERT INTO ${sanitizedCloneTable} (${filteredPiecesNames})`,
            `	SELECT ${filteredPiecesNames}`,
            `	FROM ${sanitizedTable};`
        ].join('\n'));
        await this.exec(`DROP TABLE ${sanitizedTable};`);
        await this.exec(`ALTER TABLE ${sanitizedCloneTable} RENAME TO ${sanitizedTable};`);
        return true;
    }

    // @ts-ignore
    public async updateColumn(table, schemaPiece) {
        const gateway = this.client.gateways.get(table);
        if (!gateway) throw new Error(`There is no gateway defined with the name ${table}.`);

        const sanitizedTable = Util.sanitizeKeyName(table),
            sanitizedCloneTable = Util.sanitizeKeyName(`${table}_temp`);

        const allPieces = [...gateway.schema.values(true)];
        const index = allPieces.findIndex(piece => schemaPiece.path === piece.path);
        if (index === -1) throw new Error(`There is no key ${schemaPiece.key} defined in the current schema for ${table}.`);

        const allPiecesNames = allPieces.map((piece): string => Util.sanitizeKeyName(piece.path)).join(', ');
        // @ts-ignore
        const parsedDatatypes = allPieces.map(this.qb.parse.bind(this.qb));
        parsedDatatypes[index] = `${Util.sanitizeKeyName(schemaPiece.key)} ${schemaPiece.type}`;

        await this.createTable(sanitizedCloneTable, parsedDatatypes);
        await this.exec([
            `INSERT INTO ${sanitizedCloneTable} (${allPiecesNames})`,
            `	SELECT ${allPiecesNames}`,
            `	FROM ${sanitizedTable};`
        ].join('\n'));
        await this.exec(`DROP TABLE ${sanitizedTable};`);
        await this.exec(`ALTER TABLE ${sanitizedCloneTable} RENAME TO ${sanitizedTable};`);
        return true;
    }

    public async getColumns(table: string): Promise<string[]> {
        const result = await this.runAll(`PRAGMA table_info(${Util.sanitizeKeyName(table)});`);
        return result.map((row): string => row.name);
    }

    private runGet(sql: any, ...options: any[]): Promise<any> {
        return this.db!.get(sql, ...options);
    }

    private runAll(sql: any, ...options: any[]): Promise<any[]> {
        return this.db!.all(sql, ...options);
    }

    private run(sql: any, ...options: any[]): Promise<Statement> {
        return this.db!.run(sql, ...options);
    }

    private exec(sql: string): Promise<Database> {
        return this.db!.exec(sql);
    }
}