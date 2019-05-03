import { isFunction, isNumber } from '../../util/StaticUtil';

export interface SchemaEntryOptions {
    default?: any;
    filter?: any;
    array?: boolean;
    configurable?: boolean;
    min?: number;
    max?: number;
    inclusive?: boolean;
    resolve?: boolean;
}

export interface SchemaEntryEditOptions extends SchemaEntryOptions {
    type?: string;
}

export class SchemaEntry {
    public readonly type: string;
}
