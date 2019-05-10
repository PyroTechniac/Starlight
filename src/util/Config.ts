import { StarlightClient } from '../client/Client';
import { util } from 'klasa';
import { ConfigDefaults } from './Constants';
const { mergeDefault } = util;

export interface ConfigOptions {
    token?: string;
    ownerID?: string;
    prefix?: string;
    googleKey?: string;
}

export class Config {
    private readonly _ownerID!: string;
    private _prefix!: string;
    private readonly _token!: string;
    private readonly _googleKey!: string;
    public constructor(private readonly _client: StarlightClient, options: ConfigOptions = {}) {
        options = mergeDefault<ConfigOptions>(ConfigDefaults, options);
        Object.defineProperty(this, '_token', { value: options.token });
        Object.defineProperty(this, '_ownerID', { value: options.ownerID });
        Object.defineProperty(this, '_googleKey', { value: options.googleKey })
        this._prefix = options.prefix!;
    }
    public get ownerID(): string {
        return this._ownerID;
    }

    public get token(): string {
        return this._token;
    }

    public get google(): string {
        return this._googleKey;
    }

    public get prefix(): string {
        return this._prefix;
    }

    public set prefix(prefix: string) {
        this._prefix = prefix;
    }
}