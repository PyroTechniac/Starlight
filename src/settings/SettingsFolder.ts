import { isObject, objectToTuples, toTitleCase, mergeObjects, makeObject, resolveGuild, GuildResolvable } from '../util/StaticUtil';
import { Type } from '../util/Type';
import { Schema } from './schema/Schema';

export type PrimitiveType = string | number | boolean;

export interface SettingsFolderResetOptions {
    throwOnError?: boolean;
    onlyConfigurable?: boolean;
}

export interface SettingsFolderUpdateOptions extends SettingsFolderResetOptions {
    guild?: GuildResolvable;
    arrayAction?: 'add' | 'remove' | 'auto' | 'overwrite';
    arrayIndex?: number;
}

export interface SettingsFolderUpdateResultEntry {
    key: string;
    value: any;
    entry: any;
}

export interface SettingsFolderUpdateResult {
    errors: Error[];
    updated: SettingsFolderUpdateResultEntry[];
}

export class SettingsFolder extends Map<string, SettingsFolder | PrimitiveType | object | Array<PrimitiveType | object>> {
    private readonly base: any;
    public constructor(schema: Schema) {
        super();
    }
}
