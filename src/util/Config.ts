import { StarlightClient } from '../client/Client';
import { util } from 'klasa';
import { ConfigDefaults } from './Constants';
import { StarlightError } from './StarlightError';
const { mergeDefault } = util;

export interface ConfigOptions {
    token?: string;
    ownerID?: string;
    prefix?: string;
}

export class Config {
    private readonly _ownerID!: string;
    private readonly _prefix!: string;
    private readonly _token!: string;
    public constructor(private readonly _client: StarlightClient) {
        const options = mergeDefault<ConfigOptions>(ConfigDefaults, this._client.options);
        Object.defineProperty(this, '_token', { value: options.token });
        Object.defineProperty(this, '_ownerID', { value: options.ownerID });
        Object.defineProperty(this, '_prefix', { value: options.prefix });
    }
    public get ownerID(): string {
        return this._ownerID;
    }

    public get token(): string {
        return this._token;
    }

    public get prefix(): string {
        return this._prefix;
    }

    public toJSON(): object {
        return {
            token: this.token,
            owner: this.ownerID,
            prefix: this.prefix
        };
    }

    public static validate(config: Config): Config {
        if (typeof config.token !== 'string') throw new StarlightError('INVALID_ARG', 'string', 'token', typeof config.token);
        if (typeof config.ownerID !== 'string') throw new StarlightError('INVALID_ARG', 'string', 'ownerID', typeof config.ownerID);
        if (typeof config.prefix !== 'string') throw new StarlightError('INVALID_ARG', 'string', 'prefix', typeof config.prefix);
        return config;
    }
}