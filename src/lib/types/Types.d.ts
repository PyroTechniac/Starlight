import {DeepReadonly} from "klasa";

export type Constructor<T = {}> = new (...args: any[]) => T;

export type AnyObject = Record<keyof any, unknown> | {};

export type SettingsObject = DeepReadonly<Record<PropertyKey, unknown>>;

export type UserData = [string, string, string | null];
