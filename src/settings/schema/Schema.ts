import { isFunction } from '../../util/StaticUtil';
import { SettingsFolder } from '../SettingsFolder';
import { SchemaEntry, SchemaEntryOptions } from './SchemaEntry';
import { SchemaFolder } from './SchemaFolder';

export class Schema extends Map<string, SchemaEntry | SchemaFolder> {
    public readonly path: string;
    public readonly type: string;
    public readonly defaults: SettingsFolder;

    public constructor(basePath: string = '') {
        super();

        Object.defineProperty(this, 'path', { value: basePath });

        Object.defineProperty(this, 'type', { value: 'Folder' });

        Object.defineProperty(this, 'defaults', { value: new SettingsFolder(this) });
    }

    public set(key, value) {
        this.defaults.set(key, value instanceof Schema ? value.defaults : value.default);
        return super.set(key, value);
    }

    public delete(key) {
        this.defaults.delete(key);
        return super.delete(key);
    }

    public get configurableKeys(): string[] {
        const keys = [];
        for (const entry of this.values(true)) if (entry.configurable) keys.push(entry.path);
        return keys;
    }

    public get configurableValues(): string[] {
        const values: string[] = [];
        for (const entry of this.values(true)) if (entry.configurable) values.push(entry);
        return values;
    }

    public get paths(): Map<string, SchemaFolder | SchemaEntry> {
        const paths = new Map();
        for (const entry of this.values(true)) paths.set(entry.path, entry);
        return paths;
    }

    public add(key: string, typeOrCallback: any, options: SchemaEntryOptions = {}) {

    }

    public *keys(recursive: boolean = false) {
        if (recursive) {
            for (const [key, value] of super.entries()) {
                if (value.type === 'Folder') yield *(value as SchemaFolder).keys(recursive);
                else yield value;
            }
        } else {
            yield *super.keys();
        }
    }

    public *values(recursive: boolean = false) {
        if (recursive) {
            for (const value of super.values()) {
                if (value.type === 'Folder') yield *(value as SchemaFolder).values(recursive);
                else yield value;
            }
        } else {
            yield *super.values();
        }
    }

    public *entries(recursive: boolean = false) {
        if (recursive) {
            for (const [key, value] of super.entries()) {
                if (value.type === 'Folder') yield *(value as SchemaFolder).entries(recursive);
                else yield [key, value];
            }
        } else {
            yield *super.entries();
        }
    }

    public toJSON() {
        return Object.assign({}, ...[...this.values()].map(entry => ({ [entry.key]: entry.toJSON() })));
    }
}
